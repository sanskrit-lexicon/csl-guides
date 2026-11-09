#!/usr/bin/env node
// H7908 (residual of H7906, SPLIT) — OG card pixel gate.
//
// Outcome: csl-guides CI fails when a rendered OG card's pixels regress, via a
// committed golden card and a per-pixel comparison (`npm run check:og-cards`),
// wired into ci.yml after the build next to check:og-description.
//
// Why this exists (the class, not a hypothesis): H7886 v3 shipped the hybrid
// card to production with the सं mark rendered as two tofu boxes on all 157
// cards. `npm run build` was green, every text gate passed, og:image URLs were
// correct and every PNG was a valid 1200x630 image — the defect was visible
// only by looking at the deployed pixels. PR #252 fixed that instance by
// committing a raster mark (static/img/logo-mark.png); this gate is what
// catches the next image-only regression.
//
// The gate renders ONE fixed card (constants below) through the real renderer
// (plugins/og-cards/renderCard.js) and compares it per pixel against the
// committed golden at scripts/fixtures/og-cards/golden-card.png. Dimension
// mismatch, any per-pixel delta above tolerance, and a missing or undecodable
// golden all FAIL — never SKIP-as-pass (unknown states exit non-zero).
//
// ---------------------------------------------------------------------------
// Tolerance and cross-platform choice (H7906 stop-budget: state it here, never
// silently weaken the gate).
//
// The render pipeline is host-font independent by construction: satori lays
// the vendored Charis SIL TTFs (static/fonts/, SIL OFL 1.1) out as glyph
// PATHS — no <text>, no @font-face in its SVG — and resvg rasterises pure
// geometry; the site mark is a committed PNG (static/img/logo-mark.png) with
// no font dependency at all (PR #252). Nothing in the pipeline consults host
// fonts or platform APIs, so the same tree renders byte-identically wherever
// the pinned npm tree (package-lock) is installed. Measured on macOS arm64 and
// ubuntu-latest (CI, node 20) — see the fixtures README for the PR evidence.
//
// Tolerance: MAX_CHANNEL_DELTA = 0. Any channel delta above zero in any pixel
// FAILS. This is deliberate: because the pipeline is deterministic, a
// non-zero delta IS a regression, and a 1-pixel change must fail. If a future
// dependency bump ever makes the raster backend platform-dependent, do NOT
// widen this silently — record the measured difference and re-pin the golden
// to a platform-agnostic metric (dimensions + ink coverage + per-region
// deltas) or regenerate the golden on the Linux toolchain and say so here
// (H7906 stop-budget, max 3 attempts).
//
// Fixed input, frozen on purpose: the card's count row reads committed
// literals, NOT the live catalogue. The golden must never need regeneration
// because a dictionary was added (compare PR #253, where the count row's
// source mattered). Changing these constants changes the card and therefore
// REQUIRES a deliberate golden regeneration via --write-golden in a PR that
// shows the pixel diff.
//
// Negative controls (`--selftest`): the gate is only worth its CI slot if it
// can actually fail, so the selftest runs the gate as real child processes and
// asserts the exit codes — unchanged render PASSES; a golden with exactly one
// pixel changed FAILS; the v3 tofu regression (the mark rasterised from
// logo.svg without a Devanagari-capable font) FAILS; a missing golden FAILS;
// a dimension-mismatched golden FAILS.
//
// Usage:
//   node scripts/check-og-cards.mjs                    # the gate (CI entry)
//   node scripts/check-og-cards.mjs --selftest          # assert the gate's controls
//   node scripts/check-og-cards.mjs --write-golden      # (re)generate the golden
//   node scripts/check-og-cards.mjs --golden <path>     # gate against another golden
//   node scripts/check-og-cards.mjs --inject-tofu-mark  # negative-control injector
//
// Exit codes: 0 PASS · 1 FAIL (pixel/dimension/missing golden) · 2 usage or
// internal error (also non-zero: never SKIP-as-pass).
//
// Self-contained by design: the PNG encode/decode below is stdlib-zlib only.
// The repo carries no PNG codec dependency (no pngjs/sharp), and a gate whose
// comparison broke when a transitive dep reshuffled would be a dead gate.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const require = createRequire(import.meta.url);
const SELF = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = path.dirname(SELF);
const ROOT = path.resolve(SCRIPTS_DIR, '..');
const GOLDEN_DEFAULT = path.join(SCRIPTS_DIR, 'fixtures', 'og-cards', 'golden-card.png');

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_CHANNEL_DELTA = 0; // documented in the header — do not widen silently

// The frozen card. Literals only: no catalogue, no repo state, no clock.
const FIXED_CARD = Object.freeze({
  title:
    'Cologne Digital Sanskrit Dictionaries — a synchronized reader for the MW, PWG and AP90 lexica',
  description:
    'Every entry renders beside its siblings from the other dictionaries with shared lemma anchors, scanned-page links and per-entry provenance for the whole catalogue.',
  section: 'Reference',
  stats: Object.freeze([
    Object.freeze(['12', 'Dictionaries']),
    Object.freeze(['552K', 'Entries']),
    Object.freeze(['157', 'Pages']),
  ]),
});

// ---------------------------------------------------------------------------
// Minimal PNG codec (8-bit RGB/RGBA, non-interlaced — the only shapes this
// gate accepts; anything else is a loud failure, never a skip).

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function unfilterRow(filter, row, prev, bpp) {
  for (let i = 0; i < row.length; i++) {
    const a = i >= bpp ? row[i - bpp] : 0;
    const b = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    switch (filter) {
      case 0:
        break;
      case 1:
        row[i] = (row[i] + a) & 0xff;
        break;
      case 2:
        row[i] = (row[i] + b) & 0xff;
        break;
      case 3:
        row[i] = (row[i] + ((a + b) >> 1)) & 0xff;
        break;
      case 4: {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        row[i] = (row[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
        break;
      }
      default:
        throw new Error(`png: unknown filter type ${filter}`);
    }
  }
}

function decodePng(buf) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) throw new Error('png: bad signature');
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off + 12 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (data.length !== len) throw new Error(`png: truncated ${type} chunk`);
    const crc = buf.readUInt32BE(off + 8 + len);
    if (crc !== crc32(buf.subarray(off + 4, off + 8 + len))) throw new Error(`png: bad CRC in ${type}`);
    if (type === 'IHDR') {
      ihdr = {
        w: data.readUInt32BE(0),
        h: data.readUInt32BE(4),
        depth: data[8],
        color: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }
  if (!ihdr) throw new Error('png: no IHDR');
  if (ihdr.depth !== 8 || (ihdr.color !== 6 && ihdr.color !== 2) || ihdr.interlace !== 0) {
    throw new Error(
      `png: unsupported shape depth=${ihdr.depth} color=${ihdr.color} interlace=${ihdr.interlace}`,
    );
  }
  const channels = ihdr.color === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = ihdr.w * channels;
  if (raw.length !== (stride + 1) * ihdr.h) {
    throw new Error(`png: IDAT size mismatch (${raw.length} != ${(stride + 1) * ihdr.h})`);
  }
  const out = Buffer.alloc(ihdr.w * ihdr.h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < ihdr.h; y++) {
    const filter = raw[y * (stride + 1)];
    const row = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    unfilterRow(filter, row, prev, channels);
    prev = row;
    for (let x = 0; x < ihdr.w; x++) {
      const s = x * channels;
      const d = (y * ihdr.w + x) * 4;
      out[d] = row[s];
      out[d + 1] = row[s + 1];
      out[d + 2] = row[s + 2];
      out[d + 3] = channels === 4 ? row[s + 3] : 255;
    }
  }
  return { width: ihdr.w, height: ihdr.h, rgba: out };
}

function encodePng({ width, height, rgba }) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0; // no interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Rendering through the real renderer.

// Render the frozen card through plugins/og-cards/renderCard.js. markOverridePng
// substitutes the site mark (negative-control injection); the module is
// re-required per call so renderCard's internal caches cannot leak a previous
// mark into a control render.
async function renderFixedCard(markOverridePng = null) {
  const renderCardPath = path.join(ROOT, 'plugins', 'og-cards', 'renderCard.js');
  const origRead = fs.readFileSync;
  try {
    if (markOverridePng) {
      const markPath = path.join(ROOT, 'static', 'img', 'logo-mark.png');
      fs.readFileSync = function patchedRead(p, ...rest) {
        if (String(p) === markPath) return markOverridePng;
        return origRead.call(this, p, ...rest);
      };
    }
    delete require.cache[renderCardPath];
    const { renderCard } = require(renderCardPath);
    return await renderCard(FIXED_CARD.title, {
      description: FIXED_CARD.description,
      section: FIXED_CARD.section,
      stats: FIXED_CARD.stats.map(([n, label]) => [n, label]),
    });
  } finally {
    fs.readFileSync = origRead;
    delete require.cache[renderCardPath];
  }
}

// Reproduce the v3 tofu regression exactly: logo.svg draws the सं mark with a
// <text> element; rasterised without a Devanagari-capable font (only the
// committed Charis SIL is offered — it has no Devanagari coverage), the mark
// degrades to tofu/nothing, which is precisely the image-only defect that
// passed every text gate in v3. This buffer becomes the substituted mark.
function tofuMarkPng() {
  const { Resvg } = require('@resvg/resvg-js');
  const svg = fs.readFileSync(path.join(ROOT, 'static', 'img', 'logo.svg'));
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 400 },
    font: {
      loadSystemFonts: false,
      fontFiles: [path.join(ROOT, 'static', 'fonts', 'Charis-Regular.ttf')],
    },
  });
  return resvg.render().asPng();
}

// ---------------------------------------------------------------------------
// Comparison. Returns a verdict object; never throws for expected failures.

function evaluateGolden(goldenPath, renderBuf) {
  const lines = [];
  let golden;
  if (!fs.existsSync(goldenPath)) {
    lines.push(`FAIL: missing golden at ${goldenPath} (a missing golden FAILS — never SKIP-as-pass)`);
    return { ok: false, lines };
  }
  try {
    golden = decodePng(fs.readFileSync(goldenPath));
  } catch (err) {
    lines.push(`FAIL: golden undecodable — ${err.message}`);
    return { ok: false, lines };
  }
  let render;
  try {
    render = decodePng(renderBuf);
  } catch (err) {
    lines.push(`FAIL: rendered card undecodable — ${err.message}`);
    return { ok: false, lines };
  }
  if (golden.width !== render.width || golden.height !== render.height) {
    lines.push(
      `FAIL: dimension mismatch — golden ${golden.width}x${golden.height} vs rendered ${render.width}x${render.height}`,
    );
    return { ok: false, lines };
  }
  let differing = 0;
  let maxDelta = 0;
  let first = null;
  for (let i = 0; i < golden.rgba.length; i += 4) {
    let pxMax = 0;
    for (let k = 0; k < 4; k++) {
      const d = Math.abs(golden.rgba[i + k] - render.rgba[i + k]);
      if (d > pxMax) pxMax = d;
    }
    if (pxMax > maxDelta) maxDelta = pxMax;
    if (pxMax > MAX_CHANNEL_DELTA) {
      differing++;
      if (first === null) {
        const px = i / 4;
        first = `(${px % golden.width},${Math.floor(px / golden.width)}) delta=${pxMax}`;
      }
    }
  }
  const goldenSha = crypto.createHash('sha256').update(fs.readFileSync(goldenPath)).digest('hex');
  const renderSha = crypto.createHash('sha256').update(renderBuf).digest('hex');
  lines.push(
    `golden sha256=${goldenSha} · render sha256=${renderSha} · ${golden.width}x${golden.height}`,
  );
  if (differing > 0) {
    lines.push(
      `FAIL: ${differing} pixel(s) differ beyond tolerance (max channel delta ${maxDelta} > ${MAX_CHANNEL_DELTA}); first: ${first}`,
    );
    return { ok: false, lines };
  }
  lines.push(`PASS: 0 of ${golden.width * golden.height} pixels differ (tolerance ${MAX_CHANNEL_DELTA})`);
  return { ok: true, lines };
}

// ---------------------------------------------------------------------------
// Modes.

function parseArgs(argv) {
  const opts = { selftest: false, writeGolden: false, golden: GOLDEN_DEFAULT, injectTofuMark: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') opts.selftest = true;
    else if (a === '--write-golden') opts.writeGolden = true;
    else if (a === '--inject-tofu-mark') opts.injectTofuMark = true;
    else if (a === '--golden') opts.golden = path.resolve(argv[++i] ?? '');
    else if (a === '--help' || a === '-h') opts.help = true;
    else return { error: `unknown argument: ${a}` };
  }
  return opts;
}

async function runGate(opts) {
  const mark = opts.injectTofuMark ? tofuMarkPng() : null;
  const render = await renderFixedCard(mark);
  const verdict = evaluateGolden(opts.golden, render);
  for (const l of verdict.lines) console.log(l);
  return verdict.ok ? 0 : 1;
}

async function runWriteGolden() {
  const render = await renderFixedCard(null);
  fs.mkdirSync(path.dirname(GOLDEN_DEFAULT), { recursive: true });
  fs.writeFileSync(GOLDEN_DEFAULT, render);
  const { width, height } = decodePng(render);
  console.log(`golden written: ${GOLDEN_DEFAULT}`);
  console.log(`  ${width}x${height} sha256=${crypto.createHash('sha256').update(render).digest('hex')}`);
  console.log('record the toolchain in scripts/fixtures/og-cards/README.md and regenerate only with a pixel diff on display');
  return 0;
}

function runGateChild(args) {
  const r = spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}`.trim() };
}

async function runSelftest() {
  if (!fs.existsSync(GOLDEN_DEFAULT)) {
    console.log(`SELFTEST ABORT: golden missing at ${GOLDEN_DEFAULT} — generate it with --write-golden first`);
    return 2;
  }
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-cards-selftest-'));

  // Control 2 fixture: the golden with exactly ONE pixel changed.
  const tampered = decodePng(fs.readFileSync(GOLDEN_DEFAULT));
  const px = (Math.floor(tampered.height / 2) * tampered.width + Math.floor(tampered.width / 2)) * 4;
  tampered.rgba[px] = 255;
  tampered.rgba[px + 1] = 0;
  tampered.rgba[px + 2] = 0;
  tampered.rgba[px + 3] = 255;
  const tamperPath = path.join(tmpDir, 'golden-1px-tampered.png');
  fs.writeFileSync(tamperPath, encodePng(tampered));

  // Control 5 fixture: a golden-shaped PNG with the wrong dimensions.
  const dimPath = path.join(tmpDir, 'golden-dims-8x8.png');
  fs.writeFileSync(dimPath, encodePng({ width: 8, height: 8, rgba: Buffer.alloc(8 * 8 * 4, 128) }));

  const missingPath = path.join(tmpDir, 'no-such-golden.png');

  const controls = [
    { name: 'unchanged render vs committed golden', args: [], expect: 0 },
    { name: 'golden with a deliberate 1-pixel change', args: ['--golden', tamperPath], expect: 1 },
    { name: 'v3 tofu regression (mark without a Devanagari font)', args: ['--inject-tofu-mark'], expect: 1 },
    { name: 'missing golden', args: ['--golden', missingPath], expect: 1 },
    { name: 'dimension-mismatched golden', args: ['--golden', dimPath], expect: 1 },
  ];

  let allOk = true;
  for (const c of controls) {
    const r = runGateChild(c.args);
    const ok = r.code === c.expect;
    if (!ok) allOk = false;
    console.log(
      `control: ${c.name}\n  gate exit ${r.code} (expected ${c.expect}) — ${ok ? 'OK' : 'NOT OK'}\n` +
        r.out
          .split('\n')
          .map((l) => `  | ${l}`)
          .join('\n'),
    );
  }
  console.log(
    allOk
      ? 'SELFTEST PASS: the gate fires on every injected regression and passes the unchanged tree'
      : 'SELFTEST FAIL: a control did not behave as expected — the gate cannot be trusted',
  );
  return allOk ? 0 : 1;
}

const opts = parseArgs(process.argv.slice(2));
if (opts.error) {
  console.error(`usage error: ${opts.error}`);
  process.exit(2);
}
if (opts.help) {
  console.log('usage: node scripts/check-og-cards.mjs [--selftest | --write-golden] [--golden <path>] [--inject-tofu-mark]');
  process.exit(0);
}

let code;
if (opts.selftest) code = await runSelftest();
else if (opts.writeGolden) code = await runWriteGolden();
else code = await runGate(opts);
process.exit(code);
