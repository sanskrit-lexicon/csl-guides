#!/usr/bin/env node
// Builds the beginner "flashcard streak" word game item bank (H315) from a
// curated set of frequency-ranked headwords (src/data/corpus-frequency.json,
// itself sourced from kosha/VisualDCS DCS frequency) paired with a gloss
// verified against the real Monier-Williams entry in csl-orig/v02/mw/mw.txt.
//
// Unlike build-level-quiz.mjs (which derives its correct answers straight from
// the frequency feed), a word's MW sense is often NOT the first <k1> match in
// file order — e.g. "kAla" (time) is homonym 2 (homonym 1 is "black"), "muni"
// (sage) is sub-entry 1A (entry 1 is an obscure Vedic sense "impulse,
// eagerness"), "deva" (a god) is 1B (entry 1 is the adjective "heavenly,
// divine"). So the (rank, slp1 -> MW <L> id, short gloss) triples below are
// hand-picked and each cross-checked against its cited MW.txt line before
// being committed here — the short "meaning" a beginner sees is always a
// faithful compression of the quoted MW text, never invented.
//
// Output: src/data/word-game.json — bilingual (en/ru) round bank. No runtime
// dependency on this script, csl-orig, or the vendor transcoder at read time;
// only the committed JSON is imported by src/components/WordGame.js.
//
// Usage: node scripts/build-word-game.mjs   (npm run build:word-game)

import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {from_slp1, slp1_to_devanagari} from '../src/vendor/sanskrit-util.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'word-game.json');

// Each entry: rank = corpus-frequency.json rank (provenance only, not
// re-derived here to avoid a second frequency-feed round-trip); mwId = the
// MW <L> id of the specific homonym/sub-entry the gloss quotes; mwQuote = the
// verbatim MW text (trimmed) backing the gloss; gloss = { en, ru } short
// display meaning.
const WORDS = [
  {slp1: 'na', rank: 3, mwId: 102621, mwQuote: 'not, no, nor, neither', gloss: {en: 'not, no', ru: 'не, нет'}},
  {slp1: 'eva', rank: 5, mwId: 40181, mwQuote: 'so, just so, exactly so', gloss: {en: 'indeed, just, only', ru: 'именно, только'}},
  {slp1: 'sarva', rank: 14, mwId: 238107, mwQuote: 'whole, entire, all, every', gloss: {en: 'all, every, whole', ru: 'весь, каждый'}},
  {slp1: 'mahat', rank: 16, mwId: 159193, mwQuote: 'great ... large, big, huge', gloss: {en: 'great, big', ru: 'великий, большой'}},
  {slp1: 'rAjan', rank: 23, mwId: 176833, mwQuote: 'a king, sovereign, prince, chief', gloss: {en: 'a king, prince', ru: 'царь, князь'}},
  {slp1: 'deva', rank: 26, mwId: 95519, mwQuote: 'a deity, god', gloss: {en: 'a god, deity', ru: 'бог, божество'}},
  {slp1: 'arTa', rank: 33, mwId: 15840, mwQuote: 'aim, purpose', gloss: {en: 'aim, purpose, meaning', ru: 'цель, смысл'}},
  {slp1: 'Darma', rank: 36, mwId: 99903, mwQuote: 'that which is established or firm, steadfast decree, statute, ordinance, law', gloss: {en: 'law, duty, righteousness', ru: 'закон, долг, дхарма'}},
  {slp1: 'Atman', rank: 38, mwId: 23457, mwQuote: 'the individual soul, self', gloss: {en: 'the self, soul', ru: 'душа, самость'}},
  {slp1: 'putra', rank: 42, mwId: 125494, mwQuote: 'a son, child', gloss: {en: 'a son, child', ru: 'сын, дитя'}},
  {slp1: 'loka', rank: 44, mwId: 183233, mwQuote: 'the wide space or world', gloss: {en: 'the world', ru: 'мир, свет'}},
  {slp1: 'agni', rank: 45, mwId: 890, mwQuote: 'fire, sacrificial fire', gloss: {en: 'fire', ru: 'огонь'}},
  {slp1: 'kAla', rank: 59, mwId: 49358, mwQuote: 'a fixed or right point of time, a space of time, time', gloss: {en: 'time', ru: 'время'}},
  {slp1: 'pitf', rank: 68, mwId: 123987, mwQuote: 'a father', gloss: {en: 'a father', ru: 'отец'}},
  {slp1: 'manas', rank: 74, mwId: 156776, mwQuote: 'mind ... intellect, intelligence', gloss: {en: 'the mind', ru: 'ум, разум'}},
  {slp1: 'puruza', rank: 79, mwId: 126438, mwQuote: 'a man, male, human being', gloss: {en: 'a man, person', ru: 'человек, муж'}},
  {slp1: 'kAma', rank: 80, mwId: 47938, mwQuote: 'wish, desire, longing ... love, affection', gloss: {en: 'desire, love', ru: 'желание, любовь'}},
  {slp1: 'nara', rank: 83, mwId: 104026, mwQuote: 'a man, a male, a person', gloss: {en: 'a man', ru: 'мужчина'}},
  {slp1: 'guru', rank: 84, mwId: 65998, mwQuote: 'a spiritual parent or preceptor', gloss: {en: 'a teacher', ru: 'учитель, гуру'}},
  {slp1: 'fzi', rank: 86, mwId: 39047, mwQuote: 'a singer of sacred hymns, an inspired poet or sage', gloss: {en: 'a sage, seer', ru: 'мудрец, риши'}},
  {slp1: 'brAhmaRa', rank: 87, mwId: 147318, mwQuote: 'one who has divine knowledge ... a Brāhman', gloss: {en: 'a brahmin (priest)', ru: 'брахман (жрец)'}},
  {slp1: 'yoga', rank: 93, mwId: 172337, mwQuote: 'any junction, union, combination', gloss: {en: 'union, joining', ru: 'соединение, йога'}},
  {slp1: 'muni', rank: 96, mwId: 165592, mwQuote: 'a saint, sage, seer, ascetic, monk, devotee, hermit', gloss: {en: 'a sage, ascetic', ru: 'отшельник, мудрец'}},
  {slp1: 'vana', rank: 132, mwId: 185717, mwQuote: 'a forest, wood, grove', gloss: {en: 'a forest', ru: 'лес'}},
  {slp1: 'suKa', rank: 141, mwId: 245621, mwQuote: 'ease, easiness, comfort ... happiness', gloss: {en: 'happiness, ease', ru: 'счастье, лёгкость'}},
  {slp1: 'pati', rank: 145, mwId: 115014, mwQuote: 'a master, owner, possessor, lord, ruler', gloss: {en: 'a lord, master', ru: 'господин, владыка'}},
];

// The very first rounds must be near-guaranteed wins (dopamine before
// challenge) per the H315 handoff — these three are pinned to the front of
// every shuffled deck by the component, not reordered here.
const EASY_FIRST = ['na', 'eva', 'deva'];

function word(w) {
  const iast = from_slp1(w.slp1);
  const devanagari = slp1_to_devanagari(w.slp1);
  return {
    slp1: w.slp1,
    iast,
    devanagari,
    rank: w.rank,
    mwId: w.mwId,
    mwQuote: w.mwQuote,
    gloss: w.gloss,
  };
}

const words = WORDS.map(word);

const out = {
  generatedAt: '2026-07-10',
  generator: 'scripts/build-word-game.mjs (csl-guides, H315)',
  source:
    'Frequency ranks from src/data/corpus-frequency.json (VisualDCS/DCS frequency via kosha); each gloss hand-verified against its cited Monier-Williams <L> id in csl-orig/v02/mw/mw.txt (mwQuote is the verbatim MW text)',
  easyFirst: EASY_FIRST,
  words,
};

await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Wrote ${words.length} words to ${OUT}`);
