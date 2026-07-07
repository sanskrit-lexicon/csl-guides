// Compute the GH-1..GH-4 hypothesis metrics for docs/about/guides-hypotheses.md (H278).
// Reads only committed inputs: src/data/*.json + docs/dictionaries/*.mdx.
// The csl-atlas evidence is consumed via the vendored src/data/atlas-extract.json,
// never recomputed here (csl-atlas owns the analysis engine).
//
// Usage: node scripts/build-hypothesis-metrics.mjs
// Output: src/data/hypothesis-metrics.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'));

const atlas = data('atlas-extract.json');
const gold = data('which-dictionary-gold.json');
const quiz = data('which-dictionary-quiz.json');
const abbr = data('abbreviations.json');
const catalog = data('dictionaries.json');

// ---------- GH-1: which-dictionary routing accuracy ----------
const judged = gold.scenarios.filter((s) => s.quizId);
const probes = gold.scenarios.filter((s) => !s.quizId);
const quizTargets = new Set(judged.map((s) => s.quizAnswer));
const gh1 = {
  quizItems: quiz.questions.length,
  judgedItems: judged.length,
  primaryAgreement: judged.filter((s) => s.agree).length,
  itemsWithDefensibleAlternates: judged.filter((s) => s.alternates.length > 0).length,
  distinctRoutingTargets: quizTargets.size,
  catalogDictionaries: catalog.totalRows,
  probeScenarios: probes.length,
  probesRoutingOutsideQuizTargets: probes.filter(
    (s) => !quizTargets.has(s.gold) && !s.alternates.some((a) => quizTargets.has(a))
  ).length,
  neverTargetedGolds: [...new Set(probes.flatMap((s) => [s.gold, ...s.alternates]))].filter(
    (c) => !quizTargets.has(c)
  ),
};

// ---------- GH-2: page depth vs lexical novelty ----------
const words = (file) =>
  fs.readFileSync(file, 'utf8').split(/\s+/).filter(Boolean).length;
const rows = [];
for (const [code, d] of Object.entries(atlas.dicts)) {
  if (d.uniquePct === undefined) continue;
  const page = path.join(root, 'docs/dictionaries', `${code}.mdx`);
  if (!fs.existsSync(page)) continue;
  rows.push({ code, pageWords: words(page), uniquePct: d.uniquePct, entries: d.entries });
}
const rank = (vals) => {
  const sorted = vals.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(vals.length);
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1][0] === sorted[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[sorted[k][1]] = avg;
    i = j + 1;
  }
  return r;
};
const pearson = (x, y) => {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
};
const spearman = (x, y) => pearson(rank(x), rank(y));
const gh2 = {
  dictionariesCompared: rows.length,
  spearmanDepthVsUnique: +spearman(rows.map((r) => r.pageWords), rows.map((r) => r.uniquePct)).toFixed(3),
  pearsonDepthVsUnique: +pearson(rows.map((r) => r.pageWords), rows.map((r) => r.uniquePct)).toFixed(3),
  spearmanDepthVsEntries: +spearman(rows.map((r) => r.pageWords), rows.map((r) => r.entries)).toFixed(3),
  rows: rows.sort((a, b) => b.uniquePct - a.uniquePct),
};

// ---------- GH-3: learning-track coverage of beginner failure modes ----------
// Taxonomy: the documented obstacles between a beginner and a successful MW lookup
// (docs/users/reading-monier-williams + the six-quiz track's own subject matter).
const quizFiles = {
  'devanagari-quiz.json': 'F1-script-and-order',
  'translit-quiz.json': 'F2-transliteration',
  'sandhi-quiz.json': 'F3-sandhi',
  'samasa-quiz.json': 'F4-compounds',
  'which-dictionary-quiz.json': 'F9-dictionary-choice',
};
const mwTagToMode = {
  'alphabetical-order': 'F1-script-and-order',
  encoding: 'F2-transliteration',
  sandhi: 'F3-sandhi',
  compounds: 'F4-compounds',
  etymology: 'F5-dhatu-tracing',
  prefixes: 'F5-dhatu-tracing',
  symbols: 'F6-symbols',
  abbreviations: 'F7-entry-abbreviations',
  references: 'F8-citation-resolution',
  grammar: 'F10-grammatical-labels',
};
const modes = {
  'F1-script-and-order': 0, 'F2-transliteration': 0, 'F3-sandhi': 0,
  'F4-compounds': 0, 'F5-dhatu-tracing': 0, 'F6-symbols': 0,
  'F7-entry-abbreviations': 0, 'F8-citation-resolution': 0,
  'F9-dictionary-choice': 0, 'F10-grammatical-labels': 0,
};
for (const [file, mode] of Object.entries(quizFiles)) modes[mode] += data(file).questions.length;
for (const q of data('mw-quiz.json').questions) {
  const hit = new Set((q.tags || []).map((t) => mwTagToMode[t]).filter(Boolean));
  if (q.type === 'trace-to-dhatu') hit.add('F5-dhatu-tracing');
  for (const m of hit) modes[m]++;
}
const gh3 = {
  itemsPerFailureMode: modes,
  uncoveredModes: Object.entries(modes).filter(([, n]) => n === 0).map(([m]) => m),
  thinModes: Object.entries(modes).filter(([, n]) => n > 0 && n < 4).map(([m, n]) => `${m} (${n})`),
};

// ---------- GH-4: abbreviation-legend exposure ----------
const statusByCode = Object.fromEntries(abbr.dicts.map((d) => [d.code.toLowerCase(), d.status]));
let lsTotal = 0;
const lsByStatus = { data: 0, tokens: 0, none: 0, notInLegendIndex: 0 };
for (const [code, d] of Object.entries(atlas.dicts)) {
  const ls = d.ls || 0;
  lsTotal += ls;
  lsByStatus[statusByCode[code] ?? 'notInLegendIndex'] += ls;
}
const gh4 = {
  corpusLsCitations: lsTotal,
  lsByLegendStatus: lsByStatus,
  shareInWithDataDicts: +(lsByStatus.data / lsTotal).toFixed(3),
  legendCounts: abbr.counts,
};

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'scripts/build-hypothesis-metrics.mjs (H278)',
  documentedIn: 'docs/about/guides-hypotheses.md',
  gh1_routing: gh1,
  gh2_depth_vs_novelty: gh2,
  gh3_failure_mode_coverage: gh3,
  gh4_abbreviation_exposure: gh4,
};
fs.writeFileSync(
  path.join(root, 'src/data', 'hypothesis-metrics.json'),
  JSON.stringify(out, null, 1) + '\n'
);
console.log(JSON.stringify(out, (k, v) => (k === 'rows' ? `[${v.length} rows]` : v), 1));
