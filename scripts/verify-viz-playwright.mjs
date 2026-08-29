#!/usr/bin/env node
// G22 verification (H3404): load /dictionaries/landscape against the built+served
// production bundle, assert 0 console errors, landscape has 43 circles (one per
// atlas-joined dictionary row), cladogram has 41 leaves (one per Newick tip).
// Usage: npm run build && npm run serve -- --port 3404 &   then:
//   node scripts/verify-viz-playwright.mjs [baseUrl]
//
// Writes a JSON result to verify-viz-playwright.result.json and a full-page
// screenshot to verify-viz-playwright.png (both gitignored — evidence artifacts,
// not repo content).

import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://localhost:3404/csl-guides/';
const targetUrl = new URL('dictionaries/landscape', BASE).toString();

const result = {
  url: targetUrl,
  ranAt: new Date().toISOString(),
  consoleErrors: [],
  pageErrors: [],
  circleCount: null,
  leafCount: null,
  pass: false,
};

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') result.consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => result.pageErrors.push(String(err)));

await page.goto(targetUrl, {waitUntil: 'networkidle', timeout: 30000});
await page.waitForSelector('svg circle', {timeout: 10000});

result.circleCount = await page.locator('svg circle[data-group]').count();
result.leafCount = await page.locator('svg rect[data-group]').count();

await page.screenshot({path: join(ROOT, 'verify-viz-playwright.png'), fullPage: true});

result.pass =
  result.consoleErrors.length === 0 &&
  result.pageErrors.length === 0 &&
  result.circleCount === 43 &&
  result.leafCount === 41;

await browser.close();

await writeFile(
  join(ROOT, 'verify-viz-playwright.result.json'),
  JSON.stringify(result, null, 2) + '\n',
);

console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
