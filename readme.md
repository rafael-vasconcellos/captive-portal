### O que o IP forwarding faz

- Ativar o IP forwarding no Linux (ou outro SO) faz com que a máquina repasse pacotes entre interfaces de rede.

- Exemplo: se você tiver duas interfaces, eth0 e eth1, e um pacote chegar em eth0 com destino a uma rede atrás de eth1, o kernel pode encaminhar o pacote para eth1.

- Isso não altera o destino IP ou porta dos pacotes. Ou seja, pacotes destinados a outro host ainda não vão ser entregues ao seu Node.js, porque eles não têm o IP da sua máquina como destino.


### O que um proxy transparente realmente precisa

Para que um servidor Node.js receba tráfego que originalmente era destinado a outro IP, você precisa de redirecionamento. ex.: iptables / nftables (Linux)