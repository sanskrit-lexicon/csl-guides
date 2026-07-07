// Derive the public which-dictionary-routing benchmark (H281 shared task) from the
// committed gold panel. Reads only committed inputs; never edit the output by hand.
//
// Split design: dev = the 18 scenarios the site quiz also asks (system builders may
// tune on these); test = the 6 probe scenarios the quiz does not ask (report-once).
// Both splits ship with golds — this is an open benchmark with a self-reported
// leaderboard (docs/about/shared-tasks.md), not a hidden-test competition.
//
// Usage: node scripts/build-routing-benchmark.mjs
// Output: src/data/routing-benchmark.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'));

const gold = data('which-dictionary-gold.json');
const catalog = data('dictionaries.json');

const item = (s) => ({
  id: s.id,
  scenario: s.scenario,
  gold: s.gold,
  accepted: [s.gold, ...s.alternates],
});

const out = {
  task: 'which-dictionary-routing',
  version: '1.0',
  createdAt: '2026-07-07',
  license: 'CC-BY-SA-4.0',
  derivedFrom: 'src/data/which-dictionary-gold.json',
  documentedIn: 'docs/about/shared-tasks.md',
  annotation: gold.annotator,
  answerSpace: catalog.groups.flatMap((g) => g.items.map((i) => i.code)).sort(),
  metrics: {
    strict: 'prediction === gold',
    lenient: 'accepted.includes(prediction)',
  },
  splits: {
    dev: gold.scenarios.filter((s) => s.quizId).map(item),
    test: gold.scenarios.filter((s) => !s.quizId).map(item),
  },
};

fs.writeFileSync(
  path.join(root, 'src/data', 'routing-benchmark.json'),
  JSON.stringify(out, null, 1) + '\n'
);
console.log(
  `routing-benchmark.json: dev=${out.splits.dev.length} test=${out.splits.test.length} answerSpace=${out.answerSpace.length}`
);
