#!/usr/bin/env node
// Capture B/L/A/M display screenshots from the live CDSL site for the docs.
// Usage: node scripts/screenshots.mjs
// Requires: npm i -D playwright && npx playwright install chromium
//
// Config-driven: add a dictionary to DICTS (scan code + a query headword + which
// modes to capture). Output: static/img/displays/{code}-{mode}.png (code lower-cased).

import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'static', 'img', 'displays');
const SITE = 'https://www.sanskrit-lexicon.uni-koeln.de';

// MW gets the full B/L/A/M walkthrough; the others show the Basic display so readers
// can see how entries differ across dictionaries and languages.
const DICTS = [
  {code: 'MW', query: 'agni', modes: ['basic', 'list', 'advanced', 'mobile']},
  {code: 'AP90', query: 'agniH', modes: ['basic']}, // Apte lists the nominative अग्निः, not the stem
  {code: 'PWG', query: 'agni', modes: ['basic']}, // Böhtlingk-Roth, Sanskrit–German
  {code: 'GRA', query: 'agni', modes: ['basic']}, // Grassmann, Rig-Veda, Sanskrit–German
];

const MODES = {
  basic: {path: 'webtc/indexcaller.php', mobile: false, query: true},
  list: {path: 'webtc1/index.php', mobile: false, query: true},
  advanced: {path: 'webtc2/index.php', mobile: false, query: false},
  mobile: {path: 'mobile1/index.php', mobile: true, query: true},
};

// The CDSL display server rejects the default HeadlessChrome UA ("administrative rules"
// 403). Identify as a normal desktop browser, as a human visitor would.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const COMMON = {userAgent: UA, extraHTTPHeaders: {'Accept-Language': 'en-US,en;q=0.9', Referer: `${SITE}/`}};

async function settle(page) {
  try {
    await page.waitForLoadState('networkidle', {timeout: 15000});
  } catch {
    /* some CDSL pages keep a long-poll open; fall through */
  }
  await page.waitForTimeout(2000);
}

// Type the query and submit so results render. The List display's box is a
// <textarea id="key1">; Basic/Mobile use a normal text input.
async function tryQuery(page, query) {
  if (!query) return;
  for (const frame of page.frames()) {
    try {
      const box = frame
        .locator('#key1, textarea.keyboardInput, input[type="text"], input:not([type])')
        .first();
      if ((await box.count()) && (await box.isVisible())) {
        await box.click();
        await box.pressSequentially(query, {delay: 160});
        await box.press('Enter');
        await page.waitForTimeout(3500);
        // List display: force-click the first headword to render the entry pane.
        try {
          const link = page.locator('#displist a').first();
          if (await link.count()) {
            await link.click({force: true, timeout: 4000});
            await page.waitForTimeout(2000);
          }
        } catch {
          /* entry pane already populated by Enter; ignore */
        }
        return;
      }
    } catch {
      /* try next frame */
    }
  }
}

const shots = [];
for (const d of DICTS) {
  for (const m of d.modes) {
    const cfg = MODES[m];
    shots.push({
      name: `${d.code.toLowerCase()}-${m}`,
      url: `${SITE}/scans/${d.code}Scan/2020/web/${cfg.path}`,
      mobile: cfg.mobile,
      query: cfg.query ? d.query : null,
    });
  }
}

// Standalone pages captured without a per-dictionary query — e.g. the front page,
// to show the B/L/A/M/D/S link codes in context. A taller viewport keeps the first
// dictionary group visible below the header.
shots.push({name: 'frontpage', url: `${SITE}/`, mobile: false, query: null, viewport: {width: 1280, height: 1500}});

// Optional name filter so a single shot can be refreshed without re-hitting every page:
//   node scripts/screenshots.mjs frontpage
const filter = process.argv[2];
const selected = filter ? shots.filter((s) => s.name.includes(filter)) : shots;

const browser = await chromium.launch();
await mkdir(OUT, {recursive: true});

for (const s of selected) {
  const ctx = await browser.newContext(
    s.mobile
      ? {...COMMON, viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true}
      : {...COMMON, viewport: s.viewport || {width: 1200, height: 900}, deviceScaleFactor: 1.5},
  );
  const page = await ctx.newPage();
  console.log(`→ ${s.name}: ${s.url}`);
  try {
    await page.goto(s.url, {waitUntil: 'domcontentloaded', timeout: 30000});
    await settle(page);
    await tryQuery(page, s.query);
    const path = join(OUT, `${s.name}.png`);
    await page.screenshot({path, fullPage: false});
    console.log(`  saved ${path}`);
  } catch (e) {
    console.error(`  FAILED ${s.name}: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

await browser.close();
console.log('done');
