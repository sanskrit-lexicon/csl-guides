# `og-cards` golden fixture

**`golden-card.png`** — the committed golden card for the OG card pixel gate
(`scripts/check-og-cards.mjs`, `npm run check:og-cards`), minted by H7908
(residual of H7906, SPLIT).

- **sha256:** `ee5adbd252289c43c83bbe14f9f7ebdf11690b82b5cd41a2a2b56d3b3c0df9a8`
- **Size:** 1200×630 PNG (RGBA), 68 003 bytes
- **Generated:** 2026-11-09 by `node scripts/check-og-cards.mjs --write-golden`
- **Toolchain at generation:** macOS arm64, Node v26.7.0, `satori@0.63.2` +
  `@resvg/resvg-js@2.6.2` from the committed `package-lock.json`; cross-checked
  against ubuntu-latest / Node 20 (the ci.yml toolchain) in the PR that landed
  this file — see the PR body for the byte-identical evidence.

## What the golden shows

The H7886 v3 hybrid card rendered through the real renderer
(`plugins/og-cards/renderCard.js`) from the frozen input in
`scripts/check-og-cards.mjs` (`FIXED_CARD`): brand row, saffron rule, 48px
Charis title over two lines, clamped description, the raster सं mark
(`static/img/logo-mark.png`), the three-column count row and the accent strip.

**The input is frozen on purpose.** The count row reads committed literals, not
the live catalogue (compare PR #253, where the count row's source mattered):
adding a dictionary must NOT force a golden regeneration. Only a deliberate
card change does — and then the regeneration goes through
`--write-golden` in a PR that displays the pixel diff.

## Regeneration policy

The comparator is strict (any channel delta above zero FAILS — see the script
header for the cross-platform rationale). If a future dependency bump changes
the raster output legitimately:

1. Do not widen `MAX_CHANNEL_DELTA` silently.
2. If the raster backend has become platform-dependent, record the measured
   macOS/Linux difference and re-pin the golden to a platform-agnostic metric
   (dimensions + ink coverage + per-region deltas), or regenerate the golden on
   the Linux toolchain and say so here (H7906 stop-budget, max 3 attempts).
3. Regenerate with `node scripts/check-og-cards.mjs --write-golden`, show the
   before/after pixels in the PR, and update the sha256 above.
