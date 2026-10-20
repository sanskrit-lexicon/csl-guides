#!/usr/bin/env node
// Vendors the H7116 sense-order control from csl-atlas for the PWG deep page
// (docs/dictionaries/pwg-sense-order.mdx).
//
// Source (sibling repo, NOT fetched live — org reuse rule: consume, don't
// recompute; see https://github.com/sanskrit-lexicon/csl-atlas):
//   csl-atlas/data/pd/pd_sense_order_compare_summary.json
//   the committed output of csl-atlas scripts/pd_sense_order_compare.py, whose
//   report is reports/PD_SENSE_ORDER_COMPARE_2026.md
//
// Output (committed, so the site build never needs the sibling checkout):
//   src/data/pwg-sense-order.json   slim projection: pre-registered rule, verdict,
//                                   PD row, and per-dictionary rows with the
//                                   denominators the page prints.
//
// Usage: node scripts/build-pwg-sense-order.mjs            (npm run build:pwg-sense-order)
//        node scripts/build-pwg-sense-order.mjs --check    reproject and compare
//
// The source SHA-256 is recorded in the output and re-checked by --check, so a
// re-run against a drifted atlas artifact fails instead of silently re-vendoring.

import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ATLAS = process.env.ATLAS_ROOT || join(ROOT, '..', 'csl-atlas');
const SOURCE_REL = 'data/pd/pd_sense_order_compare_summary.json';
const OUT = join(ROOT, 'src', 'data', 'pwg-sense-order.json');

const NAMES = {pwg: 'Böhtlingk–Roth (PWG)', pw: 'Böhtlingk shorter (PW)', mw: 'Monier-Williams (MW)', ap: 'Apte (AP)'};
const CLOCK = 'dm';

const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const r = (v, dp = 10) => (v === null || v === undefined ? null : Math.round(v * 10 ** dp) / 10 ** dp);
const check = process.argv.includes('--check');

async function main() {
  const raw = await readFile(join(ATLAS, SOURCE_REL), 'utf8');
  const s = JSON.parse(raw);
  if (s.handoff !== 'H7116') throw new Error(`unexpected handoff ${s.handoff}`);
  if (s.primary_clock !== CLOCK) throw new Error(`unexpected primary clock ${s.primary_clock}`);

  const dictionaries = Object.keys(NAMES).map((code) => {
    const c = s.controls[code];
    const clock = c.clocks[CLOCK];
    const row = s.verdict.rows[code];
    const bands = clock.tau_by_size || {};
    return {
      code: code.toUpperCase(),
      name: NAMES[code],
      entries: clock.entries_three_plus_senses,
      tau: r(clock.mean_tau_position_vs_earliest),
      tauDcs: r(c.clocks.dcs.mean_tau_position_vs_earliest),
      medianDriftYears: clock.median_last_minus_first_years,
      twoSenseEntries: clock.entries_two_senses,
      forwardRate: r(clock.two_sense_forward_rate),
      forwardCi: clock.two_sense_forward_rate_ci95.map((v) => r(v, 6)),
      senseDivisions: c.stats.sense_divisions,
      lsResolved: c.stats.ls_resolved,
      lsInstances: c.stats.ls_instances,
      datedCitations: c.stats.dated_instances[CLOCK],
      deltaTau: r(row.delta_tau),
      deltaCi: row.delta_tau_ci95 ? row.delta_tau_ci95.map((v) => r(v, 6)) : null,
      pOneSided: r(row.p_one_sided),
      pHolm: r(row.p_holm),
      clearsFloor: row.clears_floor,
      bands: {
        small: {entries: bands['3_to_7']?.entries ?? 0, tau: r(bands['3_to_7']?.mean_tau)},
        large: {entries: bands['8_plus']?.entries ?? 0, tau: r(bands['8_plus']?.mean_tau)},
      },
    };
  });

  const pd = s.pd_clocks[CLOCK];
  const payload = {
    schemaVersion: '1.0.0',
    generatedAt: s.generated,
    generatedBy: 'node scripts/build-pwg-sense-order.mjs',
    source: {
      repo: 'sanskrit-lexicon/csl-atlas',
      path: SOURCE_REL,
      sha256: sha256(raw),
      report:
        'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/reports/PD_SENSE_ORDER_COMPARE_2026.md',
      builder:
        'https://github.com/sanskrit-lexicon/csl-atlas/blob/main/scripts/pd_sense_order_compare.py',
      handoff: 'H7116',
    },
    license: 'CC-BY-SA-4.0',
    clock: CLOCK,
    rule: {
      effectFloor: s.rule.effect_floor,
      alpha: s.rule.alpha,
      minPower: s.rule.min_power,
      reps: s.rule.reps,
      holm: s.rule.holm,
    },
    verdict: {status: s.verdict.status, text: s.verdict.text},
    pd: {
      entries: pd.entries_three_plus_senses,
      tau: r(pd.mean_tau_position_vs_earliest),
      medianDriftYears: pd.median_last_minus_first_years,
      twoSenseEntries: pd.entries_two_senses,
      forwardRate: r(pd.two_sense_forward_rate),
    },
    dictionaries,
  };

  const text = `${JSON.stringify(payload, null, 2)}\n`;
  if (check) {
    const committed = await readFile(OUT, 'utf8');
    if (committed !== text) {
      console.error(`FAIL: ${OUT} does not reproduce from ${SOURCE_REL}`);
      process.exit(1);
    }
    console.log(`OK: ${OUT.replace(ROOT + '/', '')} reproduces from the atlas artifact`);
    return;
  }
  await writeFile(OUT, text);
  console.log(`wrote src/data/pwg-sense-order.json (source sha256 ${payload.source.sha256.slice(0, 12)}…)`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
