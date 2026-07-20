#!/usr/bin/env node
// G22 regression check: verify the H279/H280 viz + data-layer pages render correctly
// against the PRODUCTION bundle (not dev mode) — "build green" only proves the JS
// compiles, not that the DOM is right at runtime. Requires: npm run build && npm run
// serve (or pass --base-url to point at an already-running server).
//
// Usage:
//   npm run build && npm run serve -- --port 3555 &
//   node scripts/verify-atlas-viz.mjs --base-url http://localhost:3555/csl-guides/
//
// Covers all 4 pages from H279 (Stream 2)/H280 (Stream 3) of H272:
//   dictionaries/landscape           - DictionaryLandscape + Cladogram charts
//   dictionaries/citation-sources    - CitationSources bar chart + dict selector
//   dictionaries/corpus-attestation  - DCS corpus-frequency coverage tables
//   dictionaries/machine-morphology  - Heritage/INRIA coverage tables
// Originally only the landscape page had a committed check; citation-sources and
// the two H280 pages were verified once ad-hoc (per .ai_state.md H279/H280) but
// never left a reusable regression script (H1217/G22, 18-07-2026).

import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const args = process.argv.slice(2);
const baseUrlArg = args.indexOf('--base-url');
const BASE = baseUrlArg !== -1 ? args[baseUrlArg + 1] : 'http://localhost:3000/csl-guides/';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const readJson = async (f) => JSON.parse(await readFile(join(DATA, f), 'utf8'));

// ---------------------------------------------------------------------------
// Expected counts are DERIVED from the same committed feeds the pages render,
// never pinned. They used to be literals (`{circles: 43, leaves: 41}`), which
// meant adding a dictionary turned this regression check red for a completely
// correct data change — and the failure said "expected 43", giving no hint that
// the right fix was to edit the checker rather than the site.
// ---------------------------------------------------------------------------

// The chart's fixed colour/legend order, mirrored from DictionaryLandscape.js.
// It cannot be imported: that file is JSX and this script runs under plain node.
// So instead of trusting the copy, `deriveCircles` asserts the data contains no
// group outside this list — if one appears, the copy has drifted AND the chart
// needs a new palette entry, and we want to hear about it either way.
const GROUP_ORDER = [
  'Sanskrit-English',
  'Specialized',
  'Sanskrit-Sanskrit',
  'Sanskrit-German',
  'English-Sanskrit',
  'Sanskrit-French',
  'Sanskrit-Latin',
];

// One <circle> per catalog dictionary that has BOTH an atlas row and a year —
// the join in DictionaryLandscape.js `joinRows()` (a dictionary with no csl-orig
// source has no atlas row; PD has no year).
function deriveCircles(catalog, atlas) {
  const groupsSeen = new Set();
  let n = 0;
  for (const g of catalog.groups) {
    for (const item of g.items) {
      if (!atlas.dicts[item.code.toLowerCase()] || !item.year) continue;
      groupsSeen.add(g.name);
      n++;
    }
  }
  const unknown = [...groupsSeen].filter((g) => !GROUP_ORDER.includes(g));
  if (unknown.length) {
    throw new Error(
      `dictionaries.json has group(s) the chart cannot colour: ${unknown.join(', ')}. ` +
        'Add them to GROUP_ORDER in DictionaryLandscape.js and to this script.',
    );
  }
  return n;
}

// Leaves of the UPGMA tree. Internal nodes in this Newick are unlabeled, so a
// leaf is exactly a name token sitting immediately after '(' or ',' and before
// its branch length.
function deriveLeaves(cladogram) {
  return (cladogram.newick.match(/[(,]\s*[A-Za-z][\w.-]*\s*:/g) || []).length;
}

const [catalog, atlas, cladogram, citationSources] = await Promise.all([
  readJson('dictionaries.json'),
  readJson('atlas-extract.json'),
  readJson('cladogram.json'),
  readJson('citation-sources.json'),
]);

const EXPECTED = {
  circles: deriveCircles(catalog, atlas),
  leaves: deriveLeaves(cladogram),
  // The <details> fallback lists every row of the `overall` feed.
  citationRows: citationSources.overall.length,
};

console.log(
  `Derived expectations from src/data: circles=${EXPECTED.circles} ` +
    `(dictionaries.json x atlas-extract.json), leaves=${EXPECTED.leaves} (cladogram.json newick), ` +
    `citation rows=${EXPECTED.citationRows} (citation-sources.json overall)`,
);

const browser = await chromium.launch();
let allOk = true;

async function checkPage(path, run) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  const url = new URL(path, BASE).toString();
  console.log(`\n-> ${url}`);
  await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
  await page.waitForTimeout(1500);

  let ok = true;
  const fail = (msg) => {
    ok = false;
    console.error(`FAIL: ${msg}`);
  };
  const okMsg = (msg) => console.log(`OK: ${msg}`);

  await run(page, {fail, ok: okMsg});

  if (consoleErrors.length) {
    fail(`${consoleErrors.length} console/page error(s):`);
    for (const e of consoleErrors.slice(0, 10)) console.error(`  ${e}`);
  } else {
    okMsg('0 console errors');
  }

  await page.close();
  if (!ok) allOk = false;
}

// landscape.mdx: DictionaryLandscape (one <circle> per dict) + Cladogram (UPGMA tree).
await checkPage('dictionaries/landscape', async (page, {fail, ok}) => {
  const circleCount = await page.locator('svg circle').count();
  if (circleCount !== EXPECTED.circles) {
    fail(`landscape circle count = ${circleCount}, expected ${EXPECTED.circles}`);
  } else {
    ok(`landscape circles = ${circleCount}`);
  }

  // Cladogram (Cladogram.js): production CSS-module classnames are hashed short
  // (no readable "leaf" substring survives minification), so select structurally
  // instead of by class — each leaf <g> holds a chip <rect> + a label <text>; the
  // axis gridline <g>s hold only a <line> + tick <text>, no <rect>.
  const leafCount = await page.locator('svg g:has(rect):has(text)').count();
  if (leafCount !== EXPECTED.leaves) {
    fail(`cladogram leaf count = ${leafCount}, expected ${EXPECTED.leaves}`);
  } else {
    ok(`cladogram leaves = ${leafCount}`);
  }
});

// citation-sources.mdx: CitationSources bar chart. Structural selectors only
// (<select>/<details>/<table> tag names survive minification; CSS-module class
// names like .barRow do not) — same discipline as the cladogram check above.
await checkPage('dictionaries/citation-sources', async (page, {fail, ok}) => {
  const selectCount = await page.locator('article select').count();
  if (selectCount < 1) fail('no dictionary <select> found');
  else ok(`dict selector present (${selectCount})`);

  // Exact, not a floor: this table is a straight render of the `overall` feed,
  // so a partial render (the regression that matters — a fallback that silently
  // drops rows) is invisible to a >=5 threshold.
  const rowCount = await page.locator('article details table tbody tr').count();
  if (rowCount !== EXPECTED.citationRows) {
    fail(`data-table fallback rows = ${rowCount}, expected ${EXPECTED.citationRows}`);
  } else {
    ok(`data-table fallback rows = ${rowCount}`);
  }

  const detailsCount = await page.locator('article details').count();
  if (detailsCount < 1) fail('no <details> data-table fallback found');
  else ok('data-table fallback (<details>) present');
});

// corpus-attestation.mdx / machine-morphology.mdx (H280): SSR-safe pure-markup
// coverage tables, not charts — verify they actually render real rows, not an
// empty/broken table.
//
// These two stay FLOORS rather than derived exact counts, deliberately. Each
// page composes several components whose row counts come from MDX props
// (`<CorpusFrequencyTop n={25} />`, `<PeriodProfiles lemmas={[...8]} />`,
// `<HeritageSample n={15} />`) — presentation choices, not data. Deriving them
// would mean re-implementing three components' slicing rules here, so the
// checker would break whenever someone tuned a prop, which is exactly the
// false-red this change set out to remove. The floor still catches the
// regression these were written for: a table that renders empty or broken.
await checkPage('dictionaries/corpus-attestation', async (page, {fail, ok}) => {
  const rowCount = await page.locator('table tbody tr').count();
  if (rowCount < 5) fail(`coverage table has only ${rowCount} rows, expected >=5`);
  else ok(`coverage table rows = ${rowCount}`);
});

await checkPage('dictionaries/machine-morphology', async (page, {fail, ok}) => {
  const rowCount = await page.locator('table tbody tr').count();
  if (rowCount < 5) fail(`coverage table has only ${rowCount} rows, expected >=5`);
  else ok(`coverage table rows = ${rowCount}`);
});

await browser.close();

if (!allOk) {
  console.error('\nG22 verification FAILED.');
  process.exit(1);
}
console.log('\nG22 verification OK — production bundle matches expected DOM shape on all 4 pages.');
