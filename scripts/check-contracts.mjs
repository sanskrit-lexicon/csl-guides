#!/usr/bin/env node
// Runs every "committed == reproducible" contract this repo has, in one pass,
// and writes a machine receipt. This is the runner the drift gates were missing:
// each gate existed (npm script + `--check` mode) but only check:ortho-edge and
// the quiz checks were wired to CI, and the sibling-dependent ones cannot run in
// GitHub Actions at all — Actions checks out this repo only (bug hunt 19.10.2026,
// A4). So they belong here: a local/nightly lane that has the sibling clones.
//
// Usage:
//   node scripts/check-contracts.mjs                 # human summary
//   node scripts/check-contracts.mjs --json          # summary as JSON on stdout
//   node scripts/check-contracts.mjs --out <path>    # receipt path (default below)
//
// Sibling roots (each defaults to ../<name> next to this repo, which a worktree
// does not have — pin the canonical clones instead):
//   KOSHA_ROOT         ../kosha               corpus-frequency
//   VISUALDCS_ROOT     ../VisualDCS           vedic-accent
//   ATLAS_ROOT         ../csl-atlas           pwg-sense-order, atlas-viz
//   SANSKRITLEX_ROOT   ../SanskritLexicography heritage-coverage
//
// Exit: 0 all green · 1 at least one RED · 2 no RED but at least one SKIP
// (a skipped gate proves nothing — it is reported, never counted as green).

import {spawnSync} from 'node:child_process';
import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {constants as fsConstants} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const jsonOnly = argv.includes('--json');

const DEFAULT_RECEIPT = join(ROOT, 'scripts', 'out', 'contracts', 'last.json');

// Root name → {env, sibling dir, human label}
const ROOTS = {
  kosha: {env: 'KOSHA_ROOT', dir: 'kosha', label: 'kosha'},
  visualdcs: {env: 'VISUALDCS_ROOT', dir: 'VisualDCS', label: 'VisualDCS'},
  atlas: {env: 'ATLAS_ROOT', dir: 'csl-atlas', label: 'csl-atlas'},
  sanskritlex: {env: 'SANSKRITLEX_ROOT', dir: 'SanskritLexicography', label: 'SanskritLexicography'},
};

// Order matters only for reading the summary: cheap and sibling-free first.
const GATES = [
  {
    id: 'pref-legend',
    script: 'check:pref-legend',
    proves: 'PWG/PW preference-legend store matches its schema + upstream key inventory',
    ci: true,
  },
  {
    id: 'ortho-edge',
    script: 'check:ortho-edge',
    proves: 'vendored SanskritSpellCheck reform maps match their SHA-256 pins',
    ci: true,
  },
  {
    id: 'quiz-positions',
    script: 'check:quiz-positions',
    proves: 'quiz banks are in canonical option order',
    ci: true,
  },
  {
    id: 'corpus-frequency',
    script: 'check:corpus-frequency',
    proves: 'corpus-frequency.json reproduces from kosha lemma_frequency.tsv',
    root: 'kosha',
  },
  {
    id: 'vedic-accent',
    script: 'check:vedic-accent',
    proves: 'vedic-accent.json reproduces from the VisualDCS Casaretto export',
    root: 'visualdcs',
  },
  {
    id: 'pwg-sense-order',
    script: 'check:pwg-sense-order',
    proves: 'pwg-sense-order.json reproduces from the csl-atlas artifact',
    root: 'atlas',
  },
  {
    id: 'atlas-viz',
    script: 'check:atlas-viz',
    proves: 'citation-sources.json + cladogram.json reproduce from csl-atlas',
    root: 'atlas',
  },
  {
    id: 'heritage-coverage',
    script: 'check:heritage-coverage',
    proves: 'heritage-coverage.json reproduces from the SanskritLexicography crosswalk',
    root: 'sanskritlex',
  },
];

function sh(cmd, args, opts = {}) {
  // shell mode takes one command-line string (spawnSync with an args array
  // under shell:true is deprecated — DEP0190); the args here are fixed
  // tokens from this file, so plain joining is safe.
  const [command, argv] = opts.shell
    ? [[cmd, ...(args || [])].join(' '), []]
    : [cmd, args];
  const r = spawnSync(command, argv, {
    cwd: ROOT,
    encoding: 'utf8',
    env: {...process.env, ...opts.env},
    maxBuffer: 16 * 1024 * 1024,
    shell: opts.shell,
  });
  return {
    code: r.status === null ? 127 : r.status,
    out: (r.stdout || '').trim(),
    err: (r.stderr || '').trim(),
  };
}

// npm is a .cmd shim on Windows: bare `npm` is ENOENT for spawnSync, and
// since the Node CVE-2024-27980 fix even `npm.cmd` is rejected (EINVAL) unless
// it runs through a shell — so the npm wrapper spawn enables `shell` there.
// Gate names are fixed tokens from this file (no spaces/metacharacters), so
// shell-joining the args is safe. `git` needs none of this (a real .exe).
const NPM = 'npm';
const NPM_SHELL = process.platform === 'win32';

// Stock Windows ships no real `python3` — only the Store alias stub, which
// prints "Python was not found" and exits non-zero, turning an interpreter
// gap into a spurious RED gate. Probe the interpreter named by the npm
// script; for python3 fall back to `python` running the same committed
// command line, and SKIP (prove nothing) when neither exists.
function interpreterAvailable(exe) {
  const r = spawnSync(exe, ['--version'], {encoding: 'utf8'});
  const text = `${r.stdout || ''} ${r.stderr || ''}`;
  return r.status === 0 && !/not found/i.test(text);
}

function resolveInterpreter(cmdline) {
  const tokens = cmdline.trim().split(/\s+/);
  const exe = tokens[0];
  if (exe === 'node' || interpreterAvailable(exe)) {
    return {exe, args: tokens.slice(1)};
  }
  if (exe === 'python3' && interpreterAvailable('python')) {
    return {exe: 'python', args: tokens.slice(1), fallback: true};
  }
  return {exe, missing: true};
}

async function exists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function lastLine(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.length ? lines[lines.length - 1] : '';
}

function stamp(date) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  );
}

const startedAt = new Date();
const head = sh('git', ['rev-parse', '--short', 'HEAD']).out || null;
const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']).out || null;
const dirtyCount = sh('git', ['status', '--porcelain']).out.split('\n').filter(Boolean).length;

const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};

// Resolve each root once; report both the path used and whether it exists.
const rootState = {};
for (const [key, spec] of Object.entries(ROOTS)) {
  const path = process.env[spec.env] || join(ROOT, '..', spec.dir);
  rootState[key] = {path, present: await exists(path), env: spec.env};
}

const results = [];
for (const gate of GATES) {
  const t0 = Date.now();
  const result = {id: gate.id, proves: gate.proves, status: 'SKIP', seconds: 0, detail: '', script: gate.script};

  if (!scripts[gate.script]) {
    result.detail = `npm script ${gate.script} is not in package.json on this branch`;
    results.push(result);
    continue;
  }
  if (gate.root) {
    const rs = rootState[gate.root];
    if (!rs.present) {
      result.detail = `sibling ${ROOTS[gate.root].label} not found at ${rs.path} (set ${rs.env})`;
      results.push(result);
      continue;
    }
  }

  const env = {};
  for (const [key, spec] of Object.entries(ROOTS)) {
    if (rootState[key].present) env[spec.env] = rootState[key].path;
  }
  const interp = resolveInterpreter(scripts[gate.script]);
  if (interp.missing) {
    result.detail =
      `interpreter ${interp.exe} not available on ${process.platform} ` +
      `(npm script: ${scripts[gate.script]})`;
    results.push(result);
    continue;
  }
  // Interpreter fallback bypasses the npm wrapper but still runs the exact
  // committed script line, with the sibling roots exported either way.
  const r = interp.fallback
    ? sh(interp.exe, interp.args, {env})
    : sh(NPM, ['run', '--silent', gate.script], {env, shell: NPM_SHELL});
  result.seconds = Number(((Date.now() - t0) / 1000).toFixed(2));
  result.exitCode = r.code;
  // Prefer the gate's own sentence on stdout; Node warnings land on stderr and
  // would otherwise become the "detail" of a green run.
  result.detail = lastLine(r.out) || lastLine(r.err);
  if (interp.fallback) {
    result.detail = `python3→python fallback — ${result.detail}`;
  }
  result.status = r.code === 0 ? 'GREEN' : 'RED';
  results.push(result);
}

const counts = {
  green: results.filter((r) => r.status === 'GREEN').length,
  red: results.filter((r) => r.status === 'RED').length,
  skipped: results.filter((r) => r.status === 'SKIP').length,
};
const exitCode = counts.red > 0 ? 1 : counts.skipped > 0 ? 2 : 0;

const receipt = {
  schemaVersion: 1,
  generatedAt: startedAt.toISOString(),
  repo: 'csl-guides',
  head,
  branch,
  dirtyFiles: dirtyCount,
  roots: Object.fromEntries(Object.entries(rootState).map(([k, v]) => [k, {path: v.path, present: v.present}])),
  gates: results,
  counts,
  exitCode,
  verdict: exitCode === 0 ? 'ALL GREEN' : exitCode === 1 ? 'RED' : 'CANNOT PROVE (skipped gates)',
};

const outPath = outIdx !== -1 ? argv[outIdx + 1] : DEFAULT_RECEIPT;
if (outPath) {
  await mkdir(dirname(outPath), {recursive: true});
  await writeFile(outPath, `${JSON.stringify(receipt, null, 2)}\n`);
  if (!jsonOnly) {
    await writeFile(join(dirname(outPath), `contracts-${stamp(startedAt)}.json`), `${JSON.stringify(receipt, null, 2)}\n`);
  }
}

if (jsonOnly) {
  console.log(JSON.stringify(receipt, null, 2));
  process.exit(exitCode);
}

const width = Math.max(...results.map((r) => r.id.length));
console.log(
  `csl-guides contract gates — ${startedAt.toISOString()} · ${branch || '?'} @ ${head || '?'}` +
    (dirtyCount ? ` · dirty (${dirtyCount} files)` : ' · clean'),
);
console.log('');
for (const r of results) {
  const mark = r.status === 'GREEN' ? 'GREEN' : r.status === 'RED' ? 'RED  ' : 'SKIP ';
  const time = r.status === 'SKIP' ? '   —' : `${String(r.seconds).padStart(5)}s`;
  console.log(`  ${mark}  ${r.id.padEnd(width)}  ${time}  ${r.detail}`);
}
console.log('');
console.log(`  ${counts.green} green · ${counts.red} red · ${counts.skipped} skipped — ${receipt.verdict}`);
if (counts.skipped) {
  console.log('  A skipped gate proves nothing: it means the sibling clone is absent, not that the feed is sound.');
}
console.log(`  receipt: ${outPath}`);
process.exit(exitCode);
