#!/usr/bin/env bash
# Share Claude Code sessions between host and container.
# Claude Code keeps sessions in ~/.claude/projects/<slug of the cwd>. The host
# path and the container path give different slugs, so this script makes the
# container slug a symlink to the host slug dir. ~/.claude/projects is a bind
# mount of the host dir, so the link also exists on the host (dangling there).
# Usage: link-sessions.sh <host workspace folder>   (cwd = container workspace)
set -euo pipefail

slug() { printf '%s' "$1" | sed 's#[^A-Za-z0-9]#-#g'; }

projects="$HOME/.claude/projects"
host_dir="$projects/$(slug "$1")"
link="$projects/$(slug "$PWD")"

# ln -sfn on a real dir puts the link INSIDE it. Stop and tell instead.
if [ -d "$link" ] && [ ! -L "$link" ]; then
  echo "link-sessions: WARN: $link is a real dir. Sessions stay separate; merge it into $host_dir by hand." >&2
  exit 0
fi
ln -sfn "$host_dir" "$link"
echo "link-sessions: $link -> $host_dir"
