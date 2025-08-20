@echo off

set "PLATFORM=%1"
if "%PLATFORM%"=="" set "PLATFORM=Wi-fi"

echo Available Interfaces:
netsh interface show interface
echo Setting IPv4 forwarding on interface: "%PLATFORM%"...

netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8080 connectaddress=127.0.0.1
netsh interface portproxy add v4tov4 listenport=53 listenaddress=0.0.0.0 connectport=5333 connectaddress=127.0.0.1
netsh interface ipv4 set interface "%PLATFORM%" forwarding=enabled
pause

:: netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
:: netsh interface portproxy show all