#!/usr/bin/env node
// Combine H1591 pilot legend store JSON (scripts/out/{pwg,pw}_legend.json) into the
// site feed consumed by the Abbreviations UI (UC-1 / H1593).
//
// Output: src/data/pref-legends.json
// Usage:  node scripts/build-pref-legends.mjs   (npm run build:pref-legends)
// Source of truth remains scripts/out/*_legend.json (emit via pref_legend_emit.py).

import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'scripts', 'out');
const DEST = join(ROOT, 'src', 'data', 'pref-legends.json');

/** Pilot dicts for UC-1 site consumption (same as pref_legend_emit.PILOT_DICTS). */
const PILOT = ['PWG', 'PW'];

async function loadLegend(code) {
  const stem = code.toLowerCase();
  const path = join(OUT_DIR, `${stem}_legend.json`);
  const raw = await readFile(path, 'utf8');
  const payload = JSON.parse(raw);
  if (payload.dict !== code) {
    throw new Error(`${path}: expected dict=${code}, got ${payload.dict}`);
  }
  if (!Array.isArray(payload.rows) || payload.n !== payload.rows.length) {
    throw new Error(`${path}: n/rows mismatch (n=${payload.n}, rows=${payload.rows?.length})`);
  }
  return payload;
}

async function main() {
  const by_dict = {};
  for (const code of PILOT) {
    by_dict[code] = await loadLegend(code);
  }
  const combined = {
    generated: new Date().toISOString().slice(0, 10),
    pilot: PILOT,
    dicts: PILOT,
    n_total: PILOT.reduce((s, c) => s + by_dict[c].n, 0),
    source: {
      note: 'Vendored from scripts/out/{pwg,pw}_legend.json (H1591 UC-3). Re-run npm run build:pref-legends after pref_legend_emit.',
      legends: Object.fromEntries(
        PILOT.map((c) => [c, `scripts/out/${c.toLowerCase()}_legend.json`]),
      ),
    },
    by_dict,
  };

  await mkdir(dirname(DEST), {recursive: true});
  await writeFile(DEST, JSON.stringify(combined, null, 2) + '\n', 'utf8');
  console.log(
    JSON.stringify({
      out: 'src/data/pref-legends.json',
      n_total: combined.n_total,
      dicts: Object.fromEntries(PILOT.map((c) => [c, by_dict[c].n])),
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
