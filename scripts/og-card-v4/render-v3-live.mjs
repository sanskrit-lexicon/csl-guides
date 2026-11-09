// H7931 — render the CURRENT v3 card for a dictionary page with the production
// renderer, unchanged, so the GitHub-vs-v3 comparison is against a live card
// and not an old evidence PNG.
//
// The pixels come from plugins/og-cards/renderCard.js exactly as deployed; the
// count row reproduces plugins/og-cards/index.js#siteStats() at this commit:
// dictionaries = totalRows of the COMMITTED feed (the plugin reads HEAD), guides
// = public docs pages (docs/internal excluded, .meta.md excluded), posts = blog
// posts. This script only reads; it writes the PNG under the evidence dir.
//
// Run: node scripts/og-card-v4/render-v3-live.mjs

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const { renderCard } = require(path.join(ROOT, 'plugins', 'og-cards', 'renderCard.js'));

// plugins/og-cards/index.js reads the committed feed via `git show HEAD:...`.
function committedJson(rel) {
  try {
    return JSON.parse(execFileSync('git', ['show', 'HEAD:' + rel], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
  } catch (e) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  }
}

function countGuidePages(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'internal') continue;
      n += countGuidePages(p);
    } else if (/\.mdx?$/.test(e.name) && !e.name.endsWith('.meta.md')) {
      n += 1;
    }
  }
  return n;
}

function siteStats() {
  const stats = [];
  const catalog = committedJson('src/data/dictionaries.json');
  if (catalog.totalRows) stats.push([catalog.totalRows, 'dictionaries']);
  const guides = countGuidePages(path.join(ROOT, 'docs'));
  if (guides) stats.push([guides, 'guides']);
  const posts = fs.readdirSync(path.join(ROOT, 'blog')).filter((f) => /\.mdx?$/.test(f)).length;
  if (posts) stats.push([posts, 'posts']);
  return stats;
}

const TITLE = 'Monier-Williams (MW)';
const DESCRIPTION =
  'Guide to the Monier-Williams Sanskrit–English Dictionary (1899) on CDSL — the standard general reference: how to read and search an entry.';

const out = path.join(ROOT, 'docs', 'internal', 'evidence', 'H7931', 'v3-live-mw.png');
const png = await renderCard(TITLE, { description: DESCRIPTION, section: 'DICTIONARIES', stats: siteStats() });
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
const stats = siteStats();
console.log(`v3-live-mw.png ${png.length} bytes · footer: ${stats.map(([n, l]) => n + ' ' + l).join(' · ')}`);
