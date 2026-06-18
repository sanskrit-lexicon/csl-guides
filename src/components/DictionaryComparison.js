import React, {useCallback, useRef, useState} from 'react';
import styles from './DictionaryComparison.module.css';

// Side-by-side lookup of one headword across several CDSL dictionaries, querying the
// LIVE Cologne API at runtime. Design verified by the 2026-06-17 CORS spike (.ai_state.md):
//
//   * The native endpoints under /scans/awork/apidev/ send `Access-Control-Allow-Origin: *`,
//     so this static page can fetch them cross-origin with no proxy and no browser-UA spoof.
//   * `getword.php` (LIVE) returns a self-contained HTML entry; we keep only the inner
//     `#CologneBasic` markup and sanitize it before injecting.
//   * The same lemma is keyed differently per dictionary (MW stems `agni`; Apte keys the
//     nominative `agniH`). We resolve the user's input per-dictionary via `getsuggest.php`
//     (LIVE JSON) — exact match if present, else the first prefix candidate — instead of the
//     experimental/flaky `dalglob` index.
//   * The server occasionally times out under load, so every column is fetched independently
//     in parallel and renders its own loading / not-found / error state.

const API = 'https://www.sanskrit-lexicon.uni-koeln.de/scans/awork/apidev';

// The starter set: the four dictionaries with verified entries + in-guide deep pages.
const DICTS = [
  {code: 'mw', label: 'Monier-Williams (MW)'},
  {code: 'ap90', label: 'Apte (AP90)'},
  {code: 'pwg', label: 'Böhtlingk-Roth (PWG)'},
  {code: 'gra', label: 'Grassmann (GRA)'},
];

// `input`/`output` values accepted by the API (see docs/developers/api.md).
const INPUT_SCHEMES = [
  {value: 'hk', label: 'Harvard-Kyoto'},
  {value: 'slp1', label: 'SLP1'},
  {value: 'roman', label: 'IAST / roman'},
  {value: 'itrans', label: 'ITRANS'},
  {value: 'deva', label: 'Devanāgarī'},
];
const OUTPUT_SCHEMES = [
  {value: 'deva', label: 'Devanāgarī'},
  {value: 'roman', label: 'IAST / roman'},
  {value: 'hk', label: 'Harvard-Kyoto'},
];

const FETCH_TIMEOUT_MS = 20000;

async function fetchWithTimeout(url, parse) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {signal: ctrl.signal});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r[parse]();
  } finally {
    clearTimeout(timer);
  }
}

// getsuggest returns prefix matches in the same scheme as `input`. Prefer an exact hit
// (e.g. PWG has `agni`); otherwise take the first candidate (e.g. Apte's `agniH`).
async function resolveKey(code, term, input) {
  const url = `${API}/getsuggest.php?dict=${code}&input=${input}&term=${encodeURIComponent(term)}`;
  const arr = await fetchWithTimeout(url, 'json');
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.includes(term) ? term : arr[0];
}

// `getword` returns a whole HTML document with a relative stylesheet link (dead off-site)
// and is third-party markup. Keep only the entry div and strip anything executable.
function extractEntry(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('#CologneBasic') || doc.body;
  root.querySelectorAll('script,style,link,meta,iframe,object,embed').forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    // getAttributeNames() returns a plain string[] — unlike spreading the live NamedNodeMap
    // `el.attributes`, which transpiles unreliably under minification.
    el.getAttributeNames().forEach((name) => {
      const n = name.toLowerCase();
      const val = el.getAttribute(name) || '';
      if (n.startsWith('on')) el.removeAttribute(name);
      else if ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(val)) el.removeAttribute(name);
    });
  });
  // The display's in-entry links are JS-driven; with handlers stripped they are inert, so
  // mark them plainly and keep them from navigating this page.
  root.querySelectorAll('a[href]').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noreferrer');
  });
  return root.innerHTML;
}

async function lookupOne(code, term, input, output) {
  const key = await resolveKey(code, term, input);
  if (!key) return {state: 'absent'};
  const url = `${API}/getword.php?dict=${code}&key=${encodeURIComponent(key)}&input=${input}&output=${output}`;
  const html = await fetchWithTimeout(url, 'text');
  if (/not found:/i.test(html) && html.length < 200) return {state: 'absent', key};
  return {state: 'ok', key, html: extractEntry(html)};
}

export default function DictionaryComparison() {
  const [term, setTerm] = useState('agni');
  const [input, setInput] = useState('hk');
  const [output, setOutput] = useState('deva');
  const [results, setResults] = useState({}); // code -> {state, key?, html?, error?}
  const [busy, setBusy] = useState(false);
  const runId = useRef(0);

  const compare = useCallback(
    (e) => {
      e.preventDefault();
      const word = term.trim();
      if (!word) return;
      const id = ++runId.current; // newer searches supersede in-flight ones
      setBusy(true);
      setResults(Object.fromEntries(DICTS.map((d) => [d.code, {state: 'loading'}])));
      // Each column is fetched independently and renders as soon as it settles — the server
      // is flaky under load, so one slow/failed dictionary never blocks the others.
      const jobs = DICTS.map((d) =>
        lookupOne(d.code, word, input, output)
          .then((res) => {
            if (id === runId.current) setResults((prev) => ({...prev, [d.code]: res}));
          })
          .catch((err) => {
            if (id !== runId.current) return;
            const msg = err.name === 'AbortError' ? 'timed out' : err.message;
            setResults((prev) => ({...prev, [d.code]: {state: 'error', error: msg}}));
          }),
      );
      Promise.allSettled(jobs).then(() => {
        if (id === runId.current) setBusy(false);
      });
    },
    [term, input, output],
  );

  return (
    <div className={styles.wrap}>
      <form className={styles.controls} onSubmit={compare}>
        <label className={styles.field}>
          <span>Headword</span>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. agni"
            aria-label="Headword to look up"
          />
        </label>
        <label className={styles.field}>
          <span>Input</span>
          <select value={input} onChange={(e) => setInput(e.target.value)} aria-label="Input transliteration scheme">
            {INPUT_SCHEMES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Output</span>
          <select value={output} onChange={(e) => setOutput(e.target.value)} aria-label="Output transliteration scheme">
            {OUTPUT_SCHEMES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={busy}>{busy ? 'Comparing…' : 'Compare'}</button>
      </form>

      <p className={styles.note}>
        Queries the live Cologne dictionary API. Each column resolves the word to that
        dictionary&rsquo;s own headword form, so the matched key may differ (MW{' '}
        <code>agni</code> vs Apte <code>agniH</code>).
      </p>

      <div className={styles.columns} aria-live="polite">
        {DICTS.map((d) => (
          <Column key={d.code} dict={d} result={results[d.code]} />
        ))}
      </div>
    </div>
  );
}

function Column({dict, result}) {
  const r = result || {state: 'idle'};
  return (
    <section className={styles.col}>
      <h3 className={styles.colHead}>{dict.label}</h3>
      {r.state === 'idle' && <p className={styles.muted}>—</p>}
      {r.state === 'loading' && <p className={styles.muted}>Loading…</p>}
      {r.state === 'absent' && (
        <p className={styles.muted}>Not in this dictionary{r.key ? ` (tried ${r.key})` : ''}.</p>
      )}
      {r.state === 'error' && <p className={styles.error}>Could not load ({r.error}).</p>}
      {r.state === 'ok' && (
        <>
          <p className={styles.matched}>matched: <code>{r.key}</code></p>
          {/* Sanitized in extractEntry(): scripts/handlers/links-to-JS removed. */}
          <div className={styles.entry} dangerouslySetInnerHTML={{__html: r.html}} />
        </>
      )}
    </section>
  );
}
