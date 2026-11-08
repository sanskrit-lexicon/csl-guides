#!/usr/bin/env node
// H7903 - census of the built site's social descriptions.
//
// Every built HTML page must carry exactly one non-empty `og:description` and
// exactly one non-empty `name="description"`. Before H7903 the plugin-generated
// routes (blog tag pages, search, 404, the static newsletter redirect) carried
// neither: no `description:` frontmatter can reach a route Docusaurus generates
// from plugin data, and `blogDescription` only feeds the paginated blog list.
// plugins/og-cards now derives a description for any page that has none.
//
// Usage:
//   node scripts/og-description-census.mjs                 # human summary
//   node scripts/og-description-census.mjs --dir build     # explicit build dir
//   node scripts/og-description-census.mjs --json          # machine receipt
//
// Exit: 0 every page carries both tags once and non-empty · 1 a page is missing
// one, carries an empty one, or carries it twice.

import {readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const argv = process.argv.slice(2);
const jsonOnly = argv.includes('--json');
const dirIdx = argv.indexOf('--dir');
const BUILD_DIR = join(ROOT, dirIdx >= 0 && argv[dirIdx + 1] ? argv[dirIdx + 1] : 'build');

// Numeric character references (&#39;, &#x2014;, ...) plus the five named ones.
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Every <meta> tag matching this key in either attribute spelling. Docusaurus
// writes `property="og:description"` for the OG pair and `name="description"`
// for the plain one; matching whole tags keeps content/attribute order free.
function metaTags(html, key) {
  const re = new RegExp('<meta[^>]*(?:property|name)="' + key + '"[^>]*>', 'gi');
  return html.match(re) || [];
}

function contentOf(tag) {
  const m = tag.match(/content="([^"]*)"/);
  return m ? decodeEntities(m[1]).trim() : '';
}

function collectHtmlFiles(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'og-cards') continue; // plugin output, no HTML there
      collectHtmlFiles(p, out);
    } else if (name.endsWith('.html')) {
      out.push(p);
    }
  }
}

function pagePathOf(file) {
  const rel = relative(BUILD_DIR, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

const KEYS = [
  {key: 'og:description', label: 'og:description'},
  {key: 'description', label: 'name=description'},
];

if (!statSync(BUILD_DIR, {throwIfNoEntry: false})) {
  console.error('og-description-census: no build directory at ' + BUILD_DIR);
  console.error('Run `npm run build` first - this census reads the BUILT pages.');
  process.exit(1);
}

const files = [];
collectHtmlFiles(BUILD_DIR, files);
files.sort();

const pages = [];
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const row = {page: pagePathOf(file), problems: []};
  for (const {key, label} of KEYS) {
    const tags = metaTags(html, key);
    if (tags.length === 0) {
      row.problems.push(label + ': missing');
      continue;
    }
    if (tags.length > 1) {
      row.problems.push(label + ': ' + tags.length + ' tags (duplicate)');
    }
    const empty = tags.filter((t) => !contentOf(t));
    if (empty.length === tags.length) row.problems.push(label + ': empty');
  }
  if (row.problems.length) pages.push(row);
}

const pagesTotal = files.length;
const failing = pages.length;

const receipt = {
  buildDir: BUILD_DIR,
  pagesTotal,
  pagesOk: pagesTotal - failing,
  pagesFailing: failing,
  failingPages: pages,
};

if (jsonOnly) {
  console.log(JSON.stringify(receipt, null, 2));
} else {
  console.log('og-description-census: ' + pagesTotal + ' built pages');
  console.log('  ok      ' + (pagesTotal - failing));
  console.log('  failing ' + failing);
  for (const row of pages) {
    console.log('  - ' + row.page + '  [' + row.problems.join('; ') + ']');
  }
  if (failing > 0) {
    console.log('\nFAIL - every built page must carry one non-empty og:description');
    console.log('       and one non-empty name="description" (H7903).');
  } else {
    console.log('\nPASS - every built page carries both descriptions exactly once.');
  }
}

process.exit(failing === 0 ? 0 : 1);
