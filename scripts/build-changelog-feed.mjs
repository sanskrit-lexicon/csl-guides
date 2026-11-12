#!/usr/bin/env node
// build-changelog-feed.mjs — parse the repo's CHANGELOG.md into the committed
// feed src/data/changelog-feed.json behind the homepage "Latest from our
// changelog" card (GitHub-homepage-style widget on docs/intro.mdx).
//
// Why a committed feed and not a parse inside the component: house convention —
// every published figure is *fed, not typed* (docs/developers/data-cards.mdx),
// and components import JSON, they don't read files. The feed is a PURE
// FUNCTION of CHANGELOG.md — no timestamps anywhere in the output — so --check
// is a byte-exact comparison with nothing to ignore (stronger than the
// generatedAt-ignoring checks the sibling-repo feeds need).
//
// Entry date heuristic (documented in the data card too): the first date-shaped
// token inside the bullet — ISO `(YYYY-MM-DD…)` first (the house entry style
// puts it right after the bold title: `(2026-11-10, H7951, …)`), then
// `DD.MM.YYYY` (older "bug hunt 19.10.2026" style, read European-first, with
// an MM.DD fallback only when DD.MM is not a real date) — else the version
// header date `## [x.y.z] - YYYY-MM-DD`.
//
// `## [Unreleased]` is skipped on purpose: queue fragments live in
// changelog_queue/ and are folded into a released section at release-cut
// (H3355), so the section carries only a pointer comment — nothing to show,
// and the card only ever shows *released* entries.
//
// Titles: the bullet's bold lead-in (house style), else the text up to the
// first `: `/` — ` clause of ≥15 chars, else the whole bullet — markdown
// flattened (links → label, `**`/backticks stripped), word-boundary truncated
// to TITLE_MAX. The card CSS additionally clamps display to two lines.
//
// Usage:
//   node scripts/build-changelog-feed.mjs           # write the feed
//   node scripts/build-changelog-feed.mjs --check   # exit 1 on drift (CI)

import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256Lf} from './edge-hash.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'CHANGELOG.md');
const OUT = join(ROOT, 'src', 'data', 'changelog-feed.json');

const KEEP = 8; // entries stored in the feed; the homepage card renders 4
const TITLE_MAX = 160;

// `## [0.16.2] - 2026-11-10` (date mandatory in practice; tolerated absent).
const VERSION_RE = /^## \[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?\s*$/;
// Top-level bullets only (column 0). Continuation lines belong to the previous
// bullet and carry no title/date of their own.
const BULLET_RE = /^-\s+(\S.*)$/;
// ISO anywhere, or European DD.MM.YYYY (4-digit year keeps handoff slugs like
// `_11.07.26.md` out of the match). The /g is load-bearing: matchAll throws
// without it.
const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b|\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g;

const pad = (n) => String(n).padStart(2, '0');

function flatten(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [label](url) → label
    .replace(/[`*]/g, '') // code ticks + bold/italic markers
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const kept = space > max * 0.5 ? cut.slice(0, space) : cut;
  return `${kept.trim()}…`;
}

function titleOf(bullet) {
  // The closer must be followed by ` `/`(`/`—`/`:` or EOL — otherwise a `**`
  // inside the title (e.g. the `docs/internal/**` bullet) closes the match
  // early and the title degrades to a path fragment.
  const bold = bullet.match(/^\*\*(.+?)\*\*(?=[\s(—:]|$)/);
  let title = bold ? bold[1] : bullet;
  if (!bold) {
    // No bold lead-in (older entries): first sane clause, not the whole
    // thousand-char body — but never a stub shorter than 15 chars.
    const clauses = bullet.split(/:\s+| — /);
    if (clauses.length > 1 && clauses[0].length >= 15) title = clauses[0];
  }
  return truncate(flatten(title), TITLE_MAX);
}

function firstDate(bullet, fallback) {
  for (const m of bullet.matchAll(DATE_RE)) {
    if (m[1] !== undefined) return m[1]; // ISO
    const [, a, b, year] = m; // a.b.year — house style is DD.MM.YYYY
    if (+b >= 1 && +b <= 12 && +a >= 1 && +a <= 31) {
      return `${year}-${pad(b)}-${pad(a)}`; // European reading
    }
    if (+a >= 1 && +a <= 12 && +b >= 1 && +b <= 31) {
      return `${year}-${pad(a)}-${pad(b)}`; // MM.DD only when DD.MM is impossible
    }
    // neither reading is a real date (e.g. 2026.99.99) — keep scanning
  }
  return fallback;
}

const raw = readFileSync(SRC);
const entries = [];
let version = null;
let versionDate = null;
let versionAnchor = '';
let skippedUndated = 0;

// GitHub's heading slug for `## [0.16.2] - 2026-11-10` →
// `0162---2026-11-10` (lowercase; only [a-z0-9 -] survive; spaces → hyphens).
// Verified against the rendered blob's real id `user-content-0162---2026-11-10`
// (2026-11-12), so each widget entry deep-links to its release section.
function headingSlug(content) {
  return content.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
}

for (const line of raw.toString('utf8').split(/\r?\n/)) {
  const header = line.match(VERSION_RE);
  if (header) {
    // Unreleased → null: its queue fragments are not in this file yet (H3355).
    version = header[1] === 'Unreleased' ? null : header[1];
    versionDate = header[2] ?? null;
    versionAnchor = version === null ? '' : headingSlug(line.slice(3).trim());
    continue;
  }
  if (version === null) continue; // preamble, h1, Unreleased, prose
  const bullet = line.match(BULLET_RE);
  if (!bullet) continue;
  const date = firstDate(bullet[1], versionDate);
  if (!date) {
    skippedUndated += 1;
    console.warn(`warn: bullet under versionless header [${version}] has no date — skipped`);
    continue;
  }
  entries.push({
    version,
    date,
    title: titleOf(bullet[1]) || `Release ${version}`,
    anchor: versionAnchor,
  });
}

// Recency order regardless of file order (backdated bullets sort correctly);
// V8's sort is stable, so same-date ties keep the author's file order.
entries.sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));

const feed = {
  generatedBy: 'scripts/build-changelog-feed.mjs',
  source: 'CHANGELOG.md',
  sourceUrl: 'https://github.com/sanskrit-lexicon/csl-guides/blob/main/CHANGELOG.md',
  sourceSha256: sha256Lf(raw),
  license: 'CC BY-SA 4.0',
  entryCount: Math.min(entries.length, KEEP),
  entries: entries.slice(0, KEEP),
};

const serialized = `${JSON.stringify(feed, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = null;
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    /* missing feed = drift */
  }
  if (current !== serialized) {
    console.error(
      'changelog-feed DRIFT: src/data/changelog-feed.json does not match CHANGELOG.md.\n' +
        'Run: npm run build:changelog-feed',
    );
    process.exit(1);
  }
  console.log(
    `changelog-feed: ${feed.entryCount} entries, in sync with CHANGELOG.md (newest ${feed.entries[0]?.date ?? '—'})`,
  );
} else {
  writeFileSync(OUT, serialized);
  console.log(
    `wrote src/data/changelog-feed.json — ${feed.entryCount} entries (newest ${feed.entries[0]?.date ?? '—'})` +
      (skippedUndated ? `, ${skippedUndated} undated skipped` : ''),
  );
}
