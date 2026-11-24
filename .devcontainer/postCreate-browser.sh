#!/usr/bin/env bash
# Headless-browser support for the Playwright MCP (screenshots of the WebGL page).
#
# This devcontainer is linux/arm64, where Google Chrome has no build — so we use
# Playwright's bundled chromium (.mcp.json pins `--browser chromium`). Installing
# the runtime libs + the browser here means headless UI verification survives a
# container rebuild instead of being a manual one-off.
#
# Deliberately NON-FATAL: UI verification is a convenience, not a prerequisite
# for the container, so any failure here is a warning, never a failed create.
# `apt-get update` is tolerated-failing because a broken third-party (yarn) apt
# repo in the base image makes the overall command non-zero even though the
# debian lists we need still download. Idempotent: re-running (rebuild) is a
# no-op once the libs + browser are present.

set -u

install_browser() {
  # Subshell so `set -e` stays local — the function's exit code is the subshell's.
  (
    set -e
    sudo apt-get update || true
    sudo apt-get install -y --no-install-recommends \
      libnss3 libnspr4 libgbm1 libasound2 \
      libatk1.0-0 libatk-bridge2.0-0 libxkbcommon0 \
      libpango-1.0-0 libpangocairo-1.0-0 libcups2 libdbus-1-3 libxshmfence1 \
      libx11-6 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
      libxext6 libxi6 libxcursor1 libxtst6 libatspi2.0-0 \
      libcairo2 libcairo-gobject2 libgdk-pixbuf-2.0-0 \
      fonts-liberation libfontconfig1 libfreetype6
    # Browser binary lands in ~/.cache/ms-playwright (the remote user's home).
    npx -y playwright@latest install chromium
  )
}

if install_browser; then
  echo "devcontainer: headless chromium ready (Playwright MCP)."
else
  echo "WARN: headless chromium setup incomplete. To fix, run:" >&2
  echo "      sudo apt-get install <chromium libs> && npx playwright install chromium" >&2
fi
exit 0
