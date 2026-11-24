# Devcontainer image: Node LTS + the tools that container-bootstrap.sh and the
# Claude hooks call (python3, jq) + an iptables firewall against private target
# addresses (see init-firewall.sh). The script belongs to root. The node user
# also keeps the base image's full sudo, so the firewall stops accidental access,
# not deliberate access. The sudoers line names the script explicitly so the
# firewall keeps working if that general sudo rule is removed.
FROM mcr.microsoft.com/devcontainers/javascript-node:5-26-bookworm

# The yarn apt repo of the base image has an expired signing key (NO_PUBKEY at
# apt-get update). yarn is not used here, so the list is overwritten, not used.
RUN echo '# disabled: expired yarn GPG key breaks apt-get update' \
       > /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends iptables python3 jq

COPY init-firewall.sh /usr/local/bin/init-firewall.sh
RUN chown root:root /usr/local/bin/init-firewall.sh \
    && chmod 755 /usr/local/bin/init-firewall.sh \
    && echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" \
       > /etc/sudoers.d/init-firewall \
    && chmod 440 /etc/sudoers.d/init-firewall
