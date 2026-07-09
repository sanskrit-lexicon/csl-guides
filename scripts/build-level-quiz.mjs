#!/usr/bin/env node
// Builds the beginner "What's your Sanskrit level?" quiz item bank (H313) from
// the already-committed corpus-frequency feed (src/data/corpus-frequency.json,
// itself sourced from kosha/VisualDCS DCS frequency — see build-corpus-frequency.mjs).
// Real-word / transliteration / frequency-comparison items draw their CORRECT
// answer from real frequency-ranked lemmas (teach/test common words first, per
// H313); the akṣara-sound item's distractor syllables and the invented
// non-word distractors for the recognition item are hand-authored (there is no
// "real word, but wrong" source to draw from for a wrong-answer option).
//
// Output: src/data/level-quiz.json — bilingual (en/ru) item bank so the
// component can render either locale from the same data. No runtime
// dependency on this script or the vendor transcoder; only the committed JSON
// is imported by src/components/LevelQuiz.js.
//
// Usage: node scripts/build-level-quiz.mjs   (npm run build:level-quiz)

import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {slp1_to_devanagari, from_slp1} from '../src/vendor/sanskrit-util.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FREQ_PATH = join(ROOT, 'src', 'data', 'corpus-frequency.json');
const OUT = join(ROOT, 'src', 'data', 'level-quiz.json');

const freq = JSON.parse(await readFile(FREQ_PATH, 'utf8'));
const byRank = (r) => freq.lemmas.find((l) => l.rank === r);

const common = byRank(5); // "eva" — very common indeclinable, reads as a real word (not a bare letter)
const midFreq = byRank(50); // "anya"
const rareA = byRank(300); // "vacas"
const rareB = byRank(1000); // "bṛhat"
const rareC = byRank(1800); // "durbala"

function word(l) {
  return {slp1: l.slp1, iast: from_slp1(l.slp1), devanagari: slp1_to_devanagari(l.slp1), rank: l.rank};
}

const W = {
  common: word(common),
  midFreq: word(midFreq),
  rareA: word(rareA),
  rareB: word(rareB),
  rareC: word(rareC),
};

// Hand-authored (not corpus-derived): plausible-looking but invented akṣara
// clusters for the "spot the real word" distractors, and the four sound-test
// syllables for item 1.
const FAKE_WORDS_DEVA = ['क्ष्ठौ', 'ऴ्ऱि', 'घ्व्रॗ'];
const SYLLABLES = {
  ka: slp1_to_devanagari('ka'),
  ta: slp1_to_devanagari('ta'),
  ma: slp1_to_devanagari('ma'),
  sa: slp1_to_devanagari('sa'),
};

const items = [
  {
    id: 'letter-sound',
    difficulty: 'easiest',
    en: {
      question: `Which sound does this Devanagari letter make: ${SYLLABLES.ka}`,
      options: ['ka', 'ta', 'ma', 'sa'],
      answer: 'ka',
    },
    ru: {
      question: `Какой звук передаёт эта буква деванагари: ${SYLLABLES.ka}`,
      options: ['ka', 'ta', 'ma', 'sa'],
      answer: 'ka',
    },
  },
  {
    id: 'vowel-length',
    difficulty: 'easy',
    en: {
      question: 'Which pair shows a short vowel and its long counterpart?',
      options: ['a / ā', 'k / t', 'm / s', 'ka / ta'],
      answer: 'a / ā',
    },
    ru: {
      question: 'В какой паре показан краткий гласный и его долгая пара?',
      options: ['a / ā', 'k / t', 'm / s', 'ka / ta'],
      answer: 'a / ā',
    },
  },
  {
    id: 'real-word',
    difficulty: 'medium',
    en: {
      question: 'Which of these is a real Sanskrit word (not a made-up letter jumble)?',
      options: [W.common.devanagari, ...FAKE_WORDS_DEVA],
      answer: W.common.devanagari,
    },
    ru: {
      question: 'Какое из этого — настоящее санскритское слово (а не набор букв)?',
      options: [W.common.devanagari, ...FAKE_WORDS_DEVA],
      answer: W.common.devanagari,
    },
  },
  {
    id: 'transliteration-match',
    difficulty: 'medium',
    en: {
      question: `What does ${W.midFreq.devanagari} transliterate to?`,
      options: [W.midFreq.iast, W.rareA.iast, W.rareB.iast, W.rareC.iast],
      answer: W.midFreq.iast,
    },
    ru: {
      question: `Как ${W.midFreq.devanagari} записывается латиницей (IAST)?`,
      options: [W.midFreq.iast, W.rareA.iast, W.rareB.iast, W.rareC.iast],
      answer: W.midFreq.iast,
    },
  },
  {
    id: 'frequency-compare',
    difficulty: 'harder',
    en: {
      question: `Which word actually shows up more often in real Sanskrit texts: "${W.common.iast}" or "${W.rareC.iast}"?`,
      options: [W.common.iast, W.rareC.iast],
      answer: W.common.iast,
    },
    ru: {
      question: `Какое слово чаще встречается в реальных санскритских текстах: «${W.common.iast}» или «${W.rareC.iast}»?`,
      options: [W.common.iast, W.rareC.iast],
      answer: W.common.iast,
    },
  },
  {
    id: 'sandhi-concept',
    difficulty: 'hardest',
    en: {
      question:
        'True or false: when two Sanskrit words meet in a sentence, their sounds often change to blend smoothly (a process called sandhi).',
      options: ['True', 'False'],
      answer: 'True',
    },
    ru: {
      question:
        'Верно или нет: когда два санскритских слова стоят рядом в предложении, их звуки часто меняются, сливаясь друг с другом (это называется сандхи).',
      options: ['Верно', 'Неверно'],
      answer: 'Верно',
    },
  },
];

const out = {
  generatedAt: '2026-07-09',
  generator: 'scripts/build-level-quiz.mjs (csl-guides, H313)',
  source:
    'src/data/corpus-frequency.json (VisualDCS/DCS frequency via kosha) for real-word/transliteration/frequency items; akṣara-sound + non-word distractors hand-authored (no source for "plausible but wrong" content)',
  sourceWords: W,
  items,
};

await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Wrote ${items.length} items to ${OUT}`);
