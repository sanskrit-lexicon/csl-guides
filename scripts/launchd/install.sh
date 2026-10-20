#!/usr/bin/env bash
# Arms the weekly csl-guides contract lane.
#
#   bash scripts/launchd/install.sh              # install + load, no immediate run
#   bash scripts/launchd/install.sh --kickstart  # ...and fire it once as a live test
#   bash scripts/launchd/install.sh --uninstall  # remove the agent
#
# The driver (run-contracts.sh) is COPIED to ~/.local/state/csl-guides/ so the
# agent keeps working while the canonical clone sits on a branch or behind
# origin/main; the gates themselves are always read from a fresh checkout of
# origin/main. Re-run this script after editing the in-repo driver.

set -euo pipefail

LABEL="com.gasyoun.csl-guides-contracts.weekly"
HERE="$(cd "$(dirname "$0")" && pwd)"
STATE="${CSL_GUIDES_STATE:-$HOME/.local/state/csl-guides}"
DEST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/csl-guides-contracts.log"

case "${1:-}" in
  --uninstall)
    launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
    rm -f "$DEST"
    echo "uninstalled $LABEL (driver copy left in $STATE)"
    exit 0
    ;;
  --kickstart|"") ;;
  *)
    echo "usage: $0 [--kickstart|--uninstall]" >&2
    exit 64
    ;;
esac

mkdir -p "$STATE" "$HOME/Library/LaunchAgents" "$(dirname "$LOG")"
install -m 0755 "$HERE/run-contracts.sh" "$STATE/run-contracts.sh"

sed "s|__HOME__|$HOME|g" "$HERE/$LABEL.plist.in" > "$DEST"
plutil -lint "$DEST" >/dev/null

launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID" "$DEST"
echo "loaded $LABEL — Sunday 06:40 local"
echo "  driver:  $STATE/run-contracts.sh"
echo "  plist:   $DEST"
echo "  log:     $LOG"

if [ "${1:-}" = "--kickstart" ]; then
  echo "firing once now…"
  launchctl kickstart -k "gui/$UID/$LABEL"
  sleep 20
  echo "--- last log lines ---"
  tail -n 20 "$LOG" 2>/dev/null || echo "(no log yet)"
fi
