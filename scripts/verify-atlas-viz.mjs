#!/usr/bin/env node
// G22 regression check: verify the landscape/cladogram charts render correctly against
// the PRODUCTION bundle (not dev mode) — "build green" only proves the JS compiles, not
// that the DOM is right at runtime. Requires: npm run build && npm run serve (or pass
// --base-url to point at an already-running server).
//
// Usage:
//   npm run build && npm run serve -- --port 3555 &
//   node scripts/verify-atlas-viz.mjs --base-url http://localhost:3555/csl-guides/

import {chromium} from 'playwright';

const args = process.argv.slice(2);
const baseUrlArg = args.indexOf('--base-url');
const BASE = baseUrlArg !== -1 ? args[baseUrlArg + 1] : 'http://localhost:3000/csl-guides/';

const EXPECTED = {circles: 43, leaves: 41};

const browser = await chromium.launch();
const page = await browser.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

const url = new URL('dictionaries/landscape', BASE).toString();
console.log(`-> ${url}`);
await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
await page.waitForTimeout(1500);

// Landscape chart (DictionaryLandscape.js): one <circle> per dictionary.
const circleCount = await page.locator('svg circle').count();

// Cladogram (Cladogram.js): production CSS-module classnames are hashed short
// (no readable "leaf" substring survives minification), so select structurally
// instead of by class — each leaf <g> holds a chip <rect> + a label <text>; the
// axis gridline <g>s hold only a <line> + tick <text>, no <rect>.
const leafCount = await page.locator('svg g:has(rect):has(text)').count();

let ok = true;
if (consoleErrors.length) {
  ok = false;
  console.error(`FAIL: ${consoleErrors.length} console/page error(s):`);
  for (const e of consoleErrors.slice(0, 10)) console.error(`  ${e}`);
}
if (circleCount !== EXPECTED.circles) {
  ok = false;
  console.error(`FAIL: landscape circle count = ${circleCount}, expected ${EXPECTED.circles}`);
} else {
  console.log(`OK: landscape circles = ${circleCount}`);
}
if (leafCount !== EXPECTED.leaves) {
  ok = false;
  console.error(`FAIL: cladogram leaf count = ${leafCount}, expected ${EXPECTED.leaves}`);
} else {
  console.log(`OK: cladogram leaves = ${leafCount}`);
}

await browser.close();

if (!ok) {
  console.error('\nG22 verification FAILED.');
  process.exit(1);
}
console.log('\nG22 verification OK — production bundle matches expected DOM shape.');
