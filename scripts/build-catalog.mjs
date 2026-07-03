#!/usr/bin/env node
// Regenerates the dictionary catalog dataset from authoritative live sources:
//   1. the CDSL front page HTML  (display codes, titles, years, page counts, action links)
//   2. the sanskrit-lexicon GitHub org repo list  (code -> repo mapping)
//   3. csl-doc's source/dictionaries  (code -> Sphinx front-matter page)
//
// Output: src/data/dictionaries.json  (consumed by src/components/DictionaryCatalog.js)
//
// Usage:  node scripts/build-catalog.mjs
// No auth needed (public GitHub API + public site); ~3 network calls.

import {writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FRONT = 'https://www.sanskrit-lexicon.uni-koeln.de/';
const ORG = 'sanskrit-lexicon';
const SITE = 'https://www.sanskrit-lexicon.uni-koeln.de';

// The CDSL front-page server rejects non-browser user agents (the same 403 the screenshot
// script hits), so the front-page fetch identifies as a desktop browser. Without this the
// catalog refresh silently no-ops in CI and the committed dataset is used as-is.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Display-code -> repo name, where the GitHub repo is NOT just the upper-cased code.
const REPO_OVERRIDES = {MW: 'MWS', AE: 'ApteES', PW: 'PWK'};
// Codes that intentionally have no own repo (corrections live elsewhere / unmigrated).
const NO_REPO = new Set(['YAT', 'GST', 'LAN', 'PD', 'MWE', 'IEG', 'SNP', 'PE', 'PGN', 'ARMH', 'ACPH', 'ACSJ']);

async function getText(url) {
  const r = await fetch(url, {
    headers: {'User-Agent': BROWSER_UA, 'Accept-Language': 'en-US,en;q=0.9', Referer: `${SITE}/`},
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.text();
}
async function getJson(url) {
  const r = await fetch(url, {headers: {'User-Agent': 'csl-guides-catalog-builder', Accept: 'application/vnd.github+json'}});
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.json();
}

function parseFrontPage(html) {
  const groups = []; // {name, items:[...]}
  let current = null;
  // Walk the HTML, tracking the most recent <h2> group heading and each <tr> row.
  const tokens = html.split(/(?=<h2>|<tr)/i);
  for (const tok of tokens) {
    const h2 = tok.match(/<h2>([^<]+)<\/h2>/i);
    if (h2) {
      current = {name: h2[1].trim().replace(/\s+Dictionaries?$/i, ''), items: []};
      groups.push(current);
      continue;
    }
    if (!current) continue;
    // A dictionary row has a 58%-wide title cell with a title attribute and a link.
    // Title attr may contain apostrophes (Apte's, Lanman's…); stop only at the
    // attribute-closing `'>` (an apostrophe inside the title is never followed by `>`).
    const cell = tok.match(/width='58%'[^>]*title='([\s\S]*?)'>\s*<a href='([^']*)'>([^<]*)<\/a>/i);
    if (!cell) continue;
    const [, titleAttr, href, linkText] = cell;
    // Code + year live in the two small-font cells before the title cell.
    const code = (tok.match(/<td width='6%'><span[^>]*>\s*([A-Za-z0-9]+)/i) || [])[1] || '';
    const year = (tok.match(/<td width='6%'><span[^>]*>\s*\d+[^<]*<\/span>\s*(?:<[^>]+>\s*)*<\/td>\s*<td width='6%'><span[^>]*>\s*(\d{4})/i) || [])[2]
      || (tok.match(/>(\d{4})<\/span><\/td>/) || [])[1] || '';
    const scanCode = (tok.match(/\/scans\/([A-Za-z0-9]+)Scan\//) || [])[1] || null;
    const pages = (titleAttr.match(/(\d[\d,]*)\s*pages/i) || [])[1] || null;
    const sampleOnly = !scanCode; // PD links to a *-sample.php page, no XXXScan code
    const actions = {
      basic: /webtc\/indexcaller\.php/.test(tok),
      list: /webtc1\/index\.php/.test(tok),
      advanced: /webtc2\/index\.php/.test(tok),
      mobile: /mobile1\/index\.php/.test(tok),
      download: /webtc\/download\.html/.test(tok),
      scanPdf: /index\.php\?sfx=pdf/.test(tok),
      scanJpg: /index\.php\?sfx=jpg/.test(tok),
    };
    current.items.push({code, year, title: linkText.trim(), titleAttr, pages, scanCode, sampleOnly, href, actions});
  }
  return groups.filter((g) => g.items.length);
}

function actionUrls(scanCode) {
  if (!scanCode) return null;
  const base = `${SITE}/scans/${scanCode}Scan/2020/web`;
  return {
    overview: `${base}/index.php`,
    basic: `${base}/webtc/indexcaller.php`,
    list: `${base}/webtc1/index.php`,
    advanced: `${base}/webtc2/index.php`,
    mobile: `${base}/mobile1/index.php`,
    download: `${base}/webtc/download.html`,
    scanPdf: `${SITE}/scans/${scanCode}Scan/index.php?sfx=pdf`,
    scanJpg: `${SITE}/scans/${scanCode}Scan/index.php?sfx=jpg`,
  };
}

async function main() {
  console.log('Fetching front page…');
  const html = await getText(FRONT);
  const groups = parseFrontPage(html);
  // Single source of truth for the displayed site version (e.g. "version 2.9.0").
  const siteVersion = (html.match(/version\s+(\d+\.\d+(?:\.\d+)?)/i) || [])[1] || null;

  console.log('Fetching org repo list…');
  const repos = new Set();
  for (let page = 1; page <= 3; page++) {
    const batch = await getJson(`https://api.github.com/orgs/${ORG}/repos?per_page=100&page=${page}`);
    batch.forEach((r) => repos.add(r.name));
    if (batch.length < 100) break;
  }

  console.log('Fetching csl-doc dictionary pages…');
  const tree = await getJson(`https://api.github.com/repos/${ORG}/csl-doc/git/trees/HEAD?recursive=1`);
  const cslDocPages = new Set(
    tree.tree
      .map((t) => (t.path.match(/^source\/dictionaries\/([a-z0-9]+)\.rst$/) || [])[1])
      .filter(Boolean),
  );

  console.log('Fetching csl-orig source directories…');
  // Each dictionary's plain-text source lives at csl-orig/v02/{code}/. Map the lower-cased
  // code to the directory's own html_url so the branch is always correct.
  const v02 = await getJson(`https://api.github.com/repos/${ORG}/csl-orig/contents/v02`);
  const cslOrigDir = new Map(
    v02.filter((e) => e.type === 'dir').map((e) => [e.name.toLowerCase(), e.html_url]),
  );

  let total = 0;
  for (const g of groups) {
    for (const d of g.items) {
      total++;
      // repo mapping
      let repo = null;
      if (!NO_REPO.has(d.code)) {
        const candidate = REPO_OVERRIDES[d.code] || d.code;
        if (repos.has(candidate)) repo = candidate;
        else if (repos.has(d.code)) repo = d.code;
      }
      d.repo = repo;
      d.repoUrl = repo ? `https://github.com/${ORG}/${repo}` : null;
      // csl-doc page
      const lc = d.code.toLowerCase();
      d.cslDocPage = cslDocPages.has(lc) ? lc : null;
      d.cslDocUrl = d.cslDocPage
        ? `https://github.com/${ORG}/csl-doc/blob/main/source/dictionaries/${lc}.rst`
        : null;
      // csl-orig source directory (the canonical plain-text source for the dictionary)
      d.cslOrigUrl = cslOrigDir.get(lc) || null;
      d.urls = actionUrls(d.scanCode);
    }
  }

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: FRONT,
    siteVersion,
    totalRows: total,
    fullyDigitized: groups.reduce((n, g) => n + g.items.filter((d) => !d.sampleOnly).length, 0),
    documentedInCslDoc: groups.reduce((n, g) => n + g.items.filter((d) => d.cslDocPage).length, 0),
    withCslOrigSource: groups.reduce((n, g) => n + g.items.filter((d) => d.cslOrigUrl).length, 0),
    groups,
  };

  await mkdir(join(ROOT, 'src', 'data'), {recursive: true});
  const dest = join(ROOT, 'src', 'data', 'dictionaries.json');
  await writeFile(dest, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${dest}`);
  console.log(`  rows=${out.totalRows}  fullyDigitized=${out.fullyDigitized}  inCslDoc=${out.documentedInCslDoc}  withSource=${out.withCslOrigSource}  groups=${groups.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
