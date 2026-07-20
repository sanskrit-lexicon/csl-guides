#!/usr/bin/env node
// Normalizes option order across every quiz item bank so the correct answer is
// not parked at a fixed index (H1387). Idempotent: re-running rewrites nothing.
//
// Usage:
//   node scripts/normalize-quiz-answer-positions.mjs          (npm run normalize:quiz-positions)
//   node scripts/normalize-quiz-answer-positions.mjs --check  (exit 1 if a file would change)
//
// This is a TEXT transform, not a JSON.parse -> stringify round-trip, and that
// is deliberate. The six hand-authored banks pack several keys onto one line
// and keep their options inline; re-emitting them through JSON.stringify
// reflowed all seven files and turned a pure reorder into an 866-line diff that
// buried the actual change and threw away the authors' layout. Rewriting only
// the bracket span of each options array keeps every other byte identical.
//
// Bilingual items (the generated level-quiz has parallel en/ru blocks under one
// id) must not be permuted per-locale: sorting "True"/"False" and
// "Верно"/"Неверно" independently yields different orders and silently
// decouples the two. The order computed for the first locale of an id is cached
// and reused for the rest, which is the same rule build-level-quiz.mjs applies.

import {readFile, writeFile} from 'node:fs/promises';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, basename} from 'node:path';
import {canonicalOrder, applyOrder} from './_quiz-options.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');
const CHECK = process.argv.includes('--check');

// Index of the ] closing the [ at `start`, ignoring brackets inside strings.
function matchBracket(text, start) {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return i;
  }
  return -1;
}

// Re-emit `values` in the same layout the original span used — inline stays
// inline, multi-line keeps its element and closing-bracket indentation, and the
// file's existing line ending is preserved. That last part matters on Windows:
// these files are checked out CRLF, so hardcoding "\n" made the transform
// report permanent drift on exactly the two banks with multi-line arrays while
// reporting "0 reordered" — a rewrite that changes only invisible bytes.
function renderLike(raw, values) {
  const encoded = values.map((v) => JSON.stringify(v));
  if (!/\r?\n/.test(raw)) return `[${encoded.join(', ')}]`;
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const elemIndent = (lines[1] ?? '').match(/^[^\S\r\n]*/)[0];
  const closeIndent = (lines[lines.length - 1] ?? '').match(/^[^\S\r\n]*/)[0];
  return `[${eol}${encoded.map((e) => elemIndent + e).join(`,${eol}`)}${eol}${closeIndent}]`;
}

function normalize(text, stem) {
  let out = '';
  let cursor = 0;
  let currentId = '';
  let inspected = 0;
  let reordered = 0;
  const orderById = new Map();

  const token = /"id"\s*:\s*"([^"]*)"|"options"\s*:\s*\[/g;
  let m;
  while ((m = token.exec(text)) !== null) {
    if (m[1] !== undefined) {
      currentId = m[1];
      continue;
    }
    const open = text.indexOf('[', m.index);
    const close = matchBracket(text, open);
    if (close === -1) throw new Error(`${stem}: unterminated options array near offset ${open}`);

    const raw = text.slice(open, close + 1);
    let values;
    try {
      values = JSON.parse(raw);
    } catch {
      continue; // not a literal array we can safely rewrite
    }
    if (!Array.isArray(values) || values.length < 2 || !values.every((v) => typeof v === 'string')) {
      continue;
    }

    inspected++;
    let order = orderById.get(currentId);
    if (!order || order.length !== values.length) {
      order = canonicalOrder(values, `${stem}:${currentId}`);
      orderById.set(currentId, order);
    }
    const next = applyOrder(values, order);
    if (next.some((v, i) => v !== values[i])) reordered++;

    out += text.slice(cursor, open) + renderLike(raw, next);
    cursor = close + 1;
    token.lastIndex = cursor;
  }
  out += text.slice(cursor);
  return {text: out, inspected, reordered};
}

const files = readdirSync(DATA_DIR)
  .filter((f) => /quiz.*\.json$/i.test(f))
  .sort();

let changedFiles = 0;
let totalInspected = 0;
let totalReordered = 0;

for (const file of files) {
  const path = join(DATA_DIR, file);
  const before = await readFile(path, 'utf8');
  const {text: after, inspected, reordered} = normalize(before, basename(file, '.json'));
  totalInspected += inspected;
  totalReordered += reordered;

  // Parse-check: a text transform must never produce invalid JSON.
  JSON.parse(after);

  if (after !== before) {
    changedFiles++;
    if (CHECK) {
      console.error(`DRIFT: ${file} is not normalized — run npm run normalize:quiz-positions`);
    } else {
      await writeFile(path, after, 'utf8');
      console.log(`rewrote ${file}`);
    }
  }
}

console.log(
  `${totalInspected} option lists inspected across ${files.length} banks; ` +
    `${totalReordered} reordered; ${changedFiles} file(s) ${CHECK ? 'would change' : 'written'}.`,
);

if (CHECK && changedFiles > 0) process.exit(1);
