const dns2 = require('dns2')


const dns = new dns2({ 
    nameServers: ["127.0.0.1"],
    port: "5333"
})

dns.resolve("google.com").then(response => { 
    response.answers.forEach(answer => { 
        console.log(answer.address)
        console.log(answer.type)
    })
})