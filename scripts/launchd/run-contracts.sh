#!/usr/bin/env bash
# Weekly contract lane for csl-guides (bug hunt 19.10.2026, A4).
#
# Runs scripts/check-contracts.mjs against a FRESH detached worktree of
# origin/main, with the sibling clones pinned through the *_ROOT env vars. That
# is the whole point: the sibling-dependent gates (atlas-viz, heritage-coverage,
# corpus-frequency, vedic-accent) cannot run in GitHub Actions, which checks out
# this repo only, and a worktree of this repo has no ../<sibling> to resolve.
#
# Why a worktree and not the canonical clone: the canonical clone is a human's
# working tree — it sits on branches, carries uncommitted edits and is behind or
# ahead of origin/main at any moment. A gate that "cannot prove" on a dirty tree
# is worthless, so this lane proves origin/main specifically, then throws the
# worktree away (no exposure to worktree_gc).
#
# Exit: 0 all green · 1 a contract is RED · 2 nothing red but a gate could not
# run (missing sibling / runner not on the ref yet) · 3 environment failure.
#
# Env: CSL_GUIDES_REPO (canonical clone), CSL_GUIDES_REF (default origin/main),
#      CSL_GUIDES_WT (scratch worktree), CSL_GUIDES_STATE (receipts + log).

set -uo pipefail

REPO="${CSL_GUIDES_REPO:-$HOME/Documents/GitHub/csl-guides}"
REF="${CSL_GUIDES_REF:-origin/main}"
WT="${CSL_GUIDES_WT:-$HOME/Documents/GitHub-worktrees/csl-guides-contracts}"
STATE="${CSL_GUIDES_STATE:-$HOME/.local/state/csl-guides/contracts}"
NODE="${NODE_BIN:-/opt/homebrew/bin/node}"

mkdir -p "$STATE"
echo "== $(date -u +%FT%TZ) csl-guides contracts lane — ref: $REF"

if [ ! -d "$REPO/.git" ] && [ ! -f "$REPO/.git" ]; then
  echo "FAIL: no git checkout at $REPO (set CSL_GUIDES_REPO)"
  exit 3
fi
if [ ! -x "$NODE" ]; then
  echo "FAIL: no node at $NODE (set NODE_BIN)"
  exit 3
fi

cd "$REPO" || exit 3
git fetch --quiet origin main || echo "WARN: git fetch failed — using the local $REF"

git worktree remove --force "$WT" >/dev/null 2>&1 || true
if ! git worktree add --quiet --force --detach "$WT" "$REF"; then
  echo "FAIL: cannot check out $REF into $WT"
  exit 3
fi
trap 'git -C "$REPO" worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT

if [ ! -f "$WT/scripts/check-contracts.mjs" ]; then
  echo "CANNOT PROVE: $REF does not carry scripts/check-contracts.mjs yet (PR unmerged) — nothing to run."
  echo "{\"generatedAt\": \"$(date -u +%FT%TZ)\", \"ref\": \"$REF\", \"verdict\": \"RUNNER ABSENT\", \"exitCode\": 2}" \
    > "$STATE/last.json"
  exit 2
fi

KOSHA_ROOT="${KOSHA_ROOT:-$HOME/Documents/GitHub/kosha}" \
VISUALDCS_ROOT="${VISUALDCS_ROOT:-$HOME/Documents/GitHub/VisualDCS}" \
ATLAS_ROOT="${ATLAS_ROOT:-$HOME/Documents/GitHub/csl-atlas}" \
SANSKRITLEX_ROOT="${SANSKRITLEX_ROOT:-$HOME/Documents/GitHub/SanskritLexicography}" \
  "$NODE" "$WT/scripts/check-contracts.mjs" --out "$STATE/last.json"
status=$?

echo "== exit $status — receipt: $STATE/last.json"
exit "$status"
