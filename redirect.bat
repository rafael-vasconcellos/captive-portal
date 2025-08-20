@echo off

netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8080 connectaddress=127.0.0.1
netsh interface portproxy add v4tov4 listenport=53 listenaddress=0.0.0.0 connectport=5333 connectaddress=127.0.0.1
netsh interface ipv4 set interface "Ethernet 34" forwarding=enabled
pause