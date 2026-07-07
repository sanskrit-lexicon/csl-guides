// Heritage-coverage tables over src/data/heritage-coverage.json (the H282 Stream-5
// MW↔Heritage crosswalk aggregates). Numbers are computed from the committed feed at
// render time. SSR-safe: pure markup, no client state. SLP1 → IAST via the vendored
// sanskrit-util (src/vendor/).
import React from 'react';
import feed from '@site/src/data/heritage-coverage.json';
import {from_slp1} from '@site/src/vendor/sanskrit-util.js';
import styles from './CorpusFrequency.module.css';

const fmt = (n) => n.toLocaleString('en-US');

// Sanskrit alphabetical order over SLP1 initials (vowels, then varga consonants,
// then semivowels/sibilants/h) — matches how a reader scans a dictionary.
const SLP1_ORDER = 'aAiIuUfFxXeEoOkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL';

/** Per-initial MW↔Heritage coverage table (initials with ≥ minTotal MW entries). */
export default function HeritageCoverage({minTotal = 500}) {
  const rows = Object.entries(feed.byInitial)
    .map(([k, v]) => ({initial: k, ...v}))
    .filter((r) => r.total >= minTotal)
    .sort((a, b) => SLP1_ORDER.indexOf(a.initial) - SLP1_ORDER.indexOf(b.initial));
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Initial</th>
            <th>MW entries</th>
            <th>Heritage-covered</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.initial}>
              <td>
                <strong>{from_slp1(r.initial)}-</strong>
              </td>
              <td>{fmt(r.total)}</td>
              <td>{fmt(r.covered)}</td>
              <td className={r.pct >= 16 ? styles.hot : r.pct <= 11.5 ? styles.warm : undefined}>
                {r.pct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.caption}>
        Initials with at least {fmt(minTotal)} MW entries ({rows.length} of{' '}
        {Object.keys(feed.byInitial).length} initials). Overall:{' '}
        {fmt(feed.totals.heritageCovered)} of {fmt(feed.totals.mwEntries)} MW entries (
        {feed.totals.pct}%) have a Heritage dictionary article. Shaded = notably above /
        below the mean.
      </p>
    </div>
  );
}

/** Sample join: the most frequent DCS lemmas that carry a Heritage anchor. */
export function HeritageSample({n = 15}) {
  const base =
    'https://github.com/darkone23/Heritage_Resources/blob/master/';
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>DCS frequency rank</th>
            <th>Lemma</th>
            <th>Heritage article</th>
          </tr>
        </thead>
        <tbody>
          {feed.sample.slice(0, n).map((s) => (
            <tr key={s.slp1}>
              <td>{s.dcsRank}</td>
              <td>
                <strong>{from_slp1(s.slp1)}</strong> (<code>{s.slp1}</code>)
              </td>
              <td>
                {/* Link the file only: GitHub's blob view shows source and does not
                    honor the page's own named anchors, so the fragment is display-only. */}
                <a
                  href={base + s.anchor.split('#')[0]}
                  target="_blank"
                  rel="noopener noreferrer">
                  {s.anchor}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.caption}>
        Anchors resolve inside the Heritage_Resources GitHub mirror&apos;s{' '}
        <code>DICO/</code> hypertext dictionary (the live INRIA site blocks automated
        access — always use the mirror).
      </p>
    </div>
  );
}
