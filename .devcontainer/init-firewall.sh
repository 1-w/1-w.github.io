#!/bin/bash
# Blockt aus dem Devcontainer heraus jede private/link-lokale Zieladresse
# (Host, Docker-Bridge, andere Container, host.docker.internal), auf
# Kernel-Ebene. Öffentliches Internet (Recherche, npm, git über HTTPS) bleibt
# offen. DNS (Port 53) ist explizit erlaubt, weil Docker den Resolver auf einer
# privaten Adresse bereitstellt (Docker Desktop 192.168.65.7, OrbStack
# 0.250.250.200).
# 0.0.0.0/8: OrbStack legt host.docker.internal auf 0.250.250.254 und leitet es
# auf localhost des Macs weiter. Ohne diesen Bereich erreicht der Container
# Dienste, die auf dem Mac nur an 127.0.0.1 hängen (geprüft 2026-11-22).
#
# Grenze: Der User node hat im Basis-Image volles sudo (postCreate braucht
# apt-get). Die Regeln verhindern versehentliche Zugriffe, keinen absichtlichen.
#
# Läuft als root bei jedem Container-Start (postStartCommand). Anlass
# (abs_rag, 2026-08-30): Der Devcontainer erreichte das Live-Backend über
# 172.17.0.1:8000.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "init-firewall.sh: must run as root (sudo)" >&2
  exit 1
fi

BLOCKED_V4="0.0.0.0/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 169.254.0.0/16 100.64.0.0/10"
BLOCKED_V6="fc00::/7 fe80::/10"

add_once() { # add_once <iptables|ip6tables> <args…>
  local bin="$1"; shift
  "$bin" -C "$@" 2>/dev/null || "$bin" -A "$@"
}

# DNS zuerst — vor den Range-Blocks einsortiert (-I setzt an Position 1/2).
iptables -C OUTPUT -p udp --dport 53 -j ACCEPT 2>/dev/null \
  || iptables -I OUTPUT 1 -p udp --dport 53 -j ACCEPT
iptables -C OUTPUT -p tcp --dport 53 -j ACCEPT 2>/dev/null \
  || iptables -I OUTPUT 2 -p tcp --dport 53 -j ACCEPT

for dst in $BLOCKED_V4; do
  add_once iptables OUTPUT -d "$dst" -j REJECT
done

if command -v ip6tables >/dev/null 2>&1; then
  for dst in $BLOCKED_V6; do
    add_once ip6tables OUTPUT -d "$dst" -j REJECT 2>/dev/null || true
  done
fi

echo "init-firewall: private ranges blocked ($BLOCKED_V4), DNS allowed"
