const { Packet, createServer } = require('dns2');
const dns = require('dns')
const os = require('os')
const { config } = require('dotenv')



config()
const white_list = new Set([ "google.com" ])
const portal_hostname = "accounts.mynetwork.com"

async function getIP(host, type) { 
    if (type === Packet.TYPE.PTR) { return reverseLookup(host).catch(() => ({})) }
    else if (white_list.has(host)) { return await lookup(host).catch(() => ({})) }
    return { 
        address: process.env.MACHINE_IP ?? "127.0.0.1",
        type: Packet.TYPE.A
    }
}

function lookup(hostname) { return new Promise( (resolve, reject) => { 
    dns.lookup(hostname, (err, address, family) => { 
        if (err) reject(err)
        resolve({ 
            address,
            type: family===6? Packet.TYPE.AAAA : Packet.TYPE.A,
        })
    })
})}

async function reverseLookup(ipHostname) { return new Promise((resolve, reject) => { 
    const ipAddress = reverseNameToIP(ipHostname)
    const localAddresses = getLocalIPS()
    if (localAddresses.has(ipAddress)) {
        return resolve({
            data: portal_hostname,
            type: Packet.TYPE.PTR,
            address: undefined
        })

    } else if (ipAddress) {
        return dns.reverse(ipAddress, (err, hostnames) => { 
            if (err) reject(err)
            else if (hostnames.length && hostnames[0]) {
                resolve({ 
                    data: hostnames[0],
                    address: undefined,
                    type: Packet.TYPE.PTR
                })
            }
        })
    }

    reject({})

})}

function getLocalIPS() { 
    const addresses = new Set()
    const interfaces = os.networkInterfaces()
    Object.values(interfaces).forEach(interface => { 
        for (const address of interface) {
            if (!address.internal && address.family === "IPv4") { addresses.add(address.address) }
        }
    })
    
    return addresses
}

function reverseNameToIP(name) {
  // IPv4: x.x.x.x.in-addr.arpa
  if (name.endsWith('.in-addr.arpa')) {
    const parts = name.replace('.in-addr.arpa', '').split('.').reverse();
    return parts.join('.');
  }
  // IPv6 pode ser adicionado aqui se necessário
  return null;
}

function resolveDns(hostname, type) { return new Promise( (resolve, reject) => { 
    dns.resolve(hostname, dnsTypeToString(type), (err, addresses) => { 
        if (err) reject(err)
        const m = addresses.map(address => ({ 
            address,
            type
        }))
        resolve(m)
    })
})}

function dnsTypeToString(type) {
  const types = {
    1: 'A',        // IPv4 address
    2: 'NS',       // Authoritative Name Server
    5: 'CNAME',    // Canonical Name
    6: 'SOA',      // Start of Authority
    12: 'PTR',     // Pointer record
    15: 'MX',      // Mail exchange
    16: 'TXT',     // Text record
    28: 'AAAA',    // IPv6 address
    33: 'SRV',     // Service locator
    35: 'NAPTR',   // Naming Authority Pointer
    39: 'DNAME',   // Delegation Name
    41: 'OPT',     // EDNS Option
    43: 'DS',      // Delegation Signer
    46: 'RRSIG',   // DNSSEC Signature
    47: 'NSEC',    // Next Secure
    48: 'DNSKEY',  // DNS Key
    255: 'ANY'     // Any record
  };

  return types[type] || "ANY";
}

const server = createServer({
  udp: true,
  handle: async(request, send) => {
    const response = Packet.createResponseFromRequest(request);
    const [ question ] = request.questions;
    const { name, reqType } = question;

    console.log(`Consulta: ${name} (tipo: ${reqType})`);

    const { address, type, data } = await getIP(name, reqType)
    if (address) {
      response.answers.push({
        name,
        address,
        type,
        data,
        class: Packet.CLASS.IN,
        ttl: 300,
      });
    }

    send(response);
  }
});



server.listen({ 
    udp: { 
      port: 5333,
      address: process.env.MACHINE_IP ?? "127.0.0.1",
      type: "udp4",  // IPv4 or IPv6 (Must be either "udp4" or "udp6")
    },
});
console.log('Servidor DNS rodando na porta 5333');