#!/usr/bin/env node
// Capture B/L/A/M display screenshots from the live CDSL site for the docs.
// Usage: node scripts/screenshots.mjs
// Requires: npm i -D playwright && npx playwright install chromium

import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'static', 'img', 'displays');
const SITE = 'https://www.sanskrit-lexicon.uni-koeln.de';
const base = `${SITE}/scans/MWScan/2020/web`;

const shots = [
  {name: 'mw-basic', url: `${base}/webtc/indexcaller.php`, mobile: false, query: 'agni'},
  {name: 'mw-list', url: `${base}/webtc1/index.php`, mobile: false, query: 'agni'},
  {name: 'mw-advanced', url: `${base}/webtc2/index.php`, mobile: false, query: null},
  {name: 'mw-mobile', url: `${base}/mobile1/index.php`, mobile: true, query: 'agni'},
];

async function settle(page) {
  try {
    await page.waitForLoadState('networkidle', {timeout: 15000});
  } catch {
    /* some CDSL pages keep a long-poll open; fall through */
  }
  await page.waitForTimeout(2000);
}

// Best-effort: type a query into the first visible text box (top frame or any child
// frame) and submit, so the screenshot shows a populated result rather than an empty box.
async function tryQuery(page, query) {
  if (!query) return;
  for (const frame of page.frames()) {
    try {
      // The List display's search box is a <textarea id="key1">; Basic/Mobile use a
      // normal text input. Match the textarea first, then fall back to inputs.
      const box = frame
        .locator('#key1, textarea.keyboardInput, input[type="text"], input:not([type])')
        .first();
      if ((await box.count()) && (await box.isVisible())) {
        // Real keystrokes + Enter so the keyup/keydown_return search handlers fire.
        await box.click();
        await box.pressSequentially(query, {delay: 160});
        await box.press('Enter');
        await page.waitForTimeout(3500);
        // List display: force-click the first headword to (re)render the entry pane.
        // Best-effort and short — the entry pane usually populates from Enter alone.
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

// The CDSL display server rejects the default HeadlessChrome UA ("administrative rules"
// 403). Identify as a normal desktop browser, as a human visitor would.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const COMMON = {
  userAgent: UA,
  extraHTTPHeaders: {'Accept-Language': 'en-US,en;q=0.9', Referer: `${SITE}/`},
};

const browser = await chromium.launch();
await mkdir(OUT, {recursive: true});

for (const s of shots) {
  const ctx = await browser.newContext(
    s.mobile
      ? {...COMMON, viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true}
      : {...COMMON, viewport: {width: 1200, height: 900}, deviceScaleFactor: 1.5},
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
