#!/usr/bin/env node
// Best-practices gate for the docs set: the static checks that the Docusaurus
// build does NOT cover, in the repo's `check:` idiom (stdlib node, deterministic,
// exit 0 green / 2 RED, offenders named with paths).
//
// Covers four dimensions a "guides" site is judged on:
//   1. Provenance   — every public doc carries the `_Created: … · Last updated: …_`
//                     date line (repo convention, see docs/faq.md).
//   2. IA           — every public doc is reachable from a sidebar (Docusaurus
//                     resolves sidebar ids against BOTH the frontmatter `id:` and
//                     the path-based id; both forms are accepted here).
//   3. Content a11y — no empty-alt `![](...)` images.
//   4. Link policy  — no markdown links to private github.com/gasyoun/* repos from
//                     public docs (H1738 ruling: un-link, don't cite private repos).
//
// Agent-facing docs live under docs/internal/ (PR #235: unlisted-by-design,
// reachable only by direct link) and metadoc siblings (*.meta.md) serve the same
// audience — both are out of the public-audit scope here. MDX compile hazards
// (bare `{…}` expressions, FINDINGS §162 class) are covered by the CI build
// itself (`npm run build` fails loudly on invalid MDX), so no static brace lint.
//
// Usage:
//   node scripts/check-best-practices.mjs           # human summary, exit 0/2
//   node scripts/check-best-practices.mjs --json    # JSON offenders on stdout
//
// Exit: 0 all green · 1 script error · 2 at least one RED.

import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');

// Agent-facing surfaces per PR #235 + the metadoc convention.
const isInternal = (rel) =>
  rel.startsWith('internal/') || rel.endsWith('.meta.md');

const DATE_RE = /_Created: \d{2}-\d{2}-\d{4} · Last updated: \d{2}-\d{2}-\d{4}_/;

function* walk(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const sidebars = readFileSync(join(ROOT, 'sidebars.js'), 'utf8');
const listed = (id) => sidebars.includes(`'${id}'`);

const offenders = {
  noDateLine: [],
  unlisted: [],
  emptyAlt: [],
  privateRepoLink: [],
};

let publicPages = 0;

for (const file of [...walk(DOCS)].sort()) {
  if (!/\.(md|mdx)$/.test(file)) continue;
  const rel = relative(DOCS, file).replaceAll('\\', '/');
  if (isInternal(rel)) continue;
  publicPages += 1;

  const txt = readFileSync(file, 'utf8');
  const fm = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fmBody = fm ? fm[1] : '';
  const fmId = (fmBody.match(/^id:\s*(\S+)/m) || [])[1];
  const pathId = rel
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '');

  // 1. Provenance date line.
  if (!DATE_RE.test(txt)) offenders.noDateLine.push(rel);

  // 2. Sidebar reachability: frontmatter id OR path-based id.
  if (!listed(fmId) && !listed(pathId)) offenders.unlisted.push(rel);

  // 3. Empty alt text on markdown images.
  for (const m of txt.matchAll(/!\[[^\]]*\]\(/g)) {
    if (m[0] === '![](') offenders.emptyAlt.push(rel);
  }

  // 4. Private-repo citation guard (H1738). Only the genuinely-private
  //    gasyoun repos (live-probed 06-11-2026; the other gasyoun/* repos cited
  //    from public docs are public). Mirrors the lychee excludes in
  //    .github/workflows/link-check.yml.
  for (const m of txt.matchAll(
    /\]\(https:\/\/github\.com\/gasyoun\/(Uprava|prefaces_ieg)\/[^)]*\)/g,
  )) {
    offenders.privateRepoLink.push(`${rel}: ${m[0].slice(0, 80)}`);
  }
}

const reds = Object.entries(offenders).filter(([, v]) => v.length > 0);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({publicPages, red: reds.length, offenders}, null, 1));
} else {
  console.log(`public pages audited: ${publicPages}`);
  if (reds.length === 0) {
    console.log('best-practices gate: GREEN');
  } else {
    for (const [name, list] of reds) {
      console.log(`\nRED ${name}: ${list.length}`);
      for (const line of list.slice(0, 20)) console.log(`  - ${line}`);
      if (list.length > 20) console.log(`  … +${list.length - 20} more`);
    }
    console.log('\nbest-practices gate: RED');
  }
}

process.exit(reds.length > 0 ? 2 : 0);
