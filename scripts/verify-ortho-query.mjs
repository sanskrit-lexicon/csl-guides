#!/usr/bin/env node
// H3340 acceptance proof: the search query pipeline hits Thier -> Tier.
//
// Three layers, all against COMMITTED artifacts (no network):
//   1. map layer   — the committed expansion feed really contains the upstream
//                    pairs (de: thier->tier; ru: августъ->август).
//   2. query layer — normalizeOrthoQuery expands typed queries through that
//                    feed in BOTH directions and passes unmapped tokens through.
//   3. index layer — a real lunr index (same library, same version the search
//                    plugin bundles) resolves the normalized queries to the
//                    right documents: a page whose gloss text says "Thier" is
//                    found when the user types "tier", and vice versa.
//
// Bundle layer: after `npm run build`, grep dist assets for the patch
// sentinel to prove the normalized worker bridge is what actually shipped:
//   node scripts/verify-ortho-query.mjs --bundle <build-dir>

import {readFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(import.meta.url);

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

// --- layers 1 + 2 + 3 ---------------------------------------------------------

const feedRaw = await readFile(join(ROOT, 'src', 'data', 'ortho-query-expansions.json'), 'utf8');
const feed = JSON.parse(feedRaw);
const {makeOrthoQueryNormalizer} = await import(
  pathToFileURL(join(ROOT, 'src', 'ortho', 'orthoQueryCore.mjs'))
);
const normalizeOrthoQuery = makeOrthoQueryNormalizer(feed.expansions || {});

console.log('layer 1: expansion feed contains the canonical pairs');
check('de thier -> tier', JSON.stringify(feed.expansions.thier) === JSON.stringify(['tier']));
check('ru августъ -> август', JSON.stringify(feed.expansions['августъ']) === JSON.stringify(['август']));
check('excluded mined tail absent (from/fromm, on/ohne)', feed.expansions.from === undefined && feed.expansions.on === undefined);
check(
  'excluded 1901-c class absent (abscess/abszess)',
  feed.expansions.abscess === undefined
);

console.log('layer 2: query normalization');
check(
  '"Thier" gains "tier"',
  normalizeOrthoQuery('Thier').split(/\s+/).includes('tier'),
  `-> ${normalizeOrthoQuery('Thier')}`
);
check(
  '"Tier" gains "thier"',
  normalizeOrthoQuery('tier').split(/\s+/).includes('thier'),
  `-> ${normalizeOrthoQuery('tier')}`
);
check(
  'Cyrillic pair expands',
  normalizeOrthoQuery('августъ').split(/\s+/).includes('август') &&
    normalizeOrthoQuery('август').split(/\s+/).includes('августъ')
);
check(
  'unmapped tokens pass through untouched',
  normalizeOrthoQuery('sanskrit lexicon') === 'sanskrit lexicon',
  `-> ${normalizeOrthoQuery('sanskrit lexicon')}`
);
check(
  'multi-word query expands per token',
  normalizeOrthoQuery('the thier').includes('tier'),
  `-> ${normalizeOrthoQuery('the thier')}`
);

console.log('layer 3: lunr roundtrip (same lunr the search plugin bundles)');
const requireFromPlugin = createRequire(
  join(ROOT, 'node_modules', '@easyops-cn', 'docusaurus-search-local', 'package.json')
);
const lunr = requireFromPlugin('lunr');
const docs = [
  {id: 'a', text: 'PWG preface gloss text Thier Mittheilungen Thiergarten'},
  {id: 'b', text: 'Sanskrit lexicon user guide for the website'},
];
const idx = lunr(function () {
  this.ref('id');
  this.field('text');
  docs.forEach((d) => this.add(d));
});
const refsFor = (q) => idx.search(q).map((r) => r.ref);
const norm = (q) => normalizeOrthoQuery(q);

check('typed modern "tier" finds the Thier page', refsFor(norm('tier')).includes('a'), `q="${norm('tier')}"`);
check('typed old "thier" still finds it', refsFor(norm('thier')).includes('a'), `q="${norm('thier')}"`);
check('unrelated query does not leak', !refsFor(norm('sanskrit')).includes('a'));
check('control doc still findable', refsFor(norm('guide')).includes('b'));

// --- bundle layer (--bundle <dir>) --------------------------------------------

if (process.argv.includes('--bundle')) {
  const buildDir = process.argv[process.argv.indexOf('--bundle') + 1];
  console.log('bundle layer: normalized worker bridge actually shipped');
  const SENTINEL = 'h3340-ortho-query-normalizer';
  let found = false;
  async function walk(dir) {
    for (const e of await readdir(dir, {withFileTypes: true})) {
      const p = join(dir, e.name);
      if (found) return;
      if (e.isDirectory()) await walk(p);
      else if (/\.js$/.test(e.name)) {
        const text = await readFile(p, 'utf8');
        if (text.includes(SENTINEL)) {
          found = true;
          console.log(`  sentinel found in ${p.replace(ROOT, '')}`);
          return;
        }
      }
    }
  }
  await walk(buildDir);
  check('patched searchByWorker is bundled', found);
  if (!found) {
    console.error(
      '\nBUNDLE RED: the stock searchByWorker shipped instead of the ortho-normalized one.\n' +
        'The webpack alias in plugins/ortho-search-normalize.mjs did not bite.'
    );
  }
}

if (failures > 0) {
  console.error(`\nverify:ortho-query RED — ${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nverify:ortho-query GREEN — Thier->Tier proven end-to-end at unit level.');
