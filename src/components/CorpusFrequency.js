// Corpus-attestation tables over src/data/corpus-frequency.json (the H282 Stream-5
// DCS frequency feed). All numbers are computed from the committed feed at render
// time so the page can never drift from the artifact. SSR-safe: pure markup, no
// client state. SLP1 → IAST via the vendored sanskrit-util (src/vendor/).
import React from 'react';
import feed from '@site/src/data/corpus-frequency.json';
import {from_slp1} from '@site/src/vendor/sanskrit-util.js';
import styles from './CorpusFrequency.module.css';

const TOKENS = feed.stats.tokensCounted;
const fmt = (n) => n.toLocaleString('en-US');

// Cumulative token share of the top-N lemmas (the feed is already rank-ordered).
function cumulativeShare(n) {
  const sum = feed.lemmas.slice(0, n).reduce((s, l) => s + l.count, 0);
  return {sum, pct: (100 * sum) / TOKENS};
}

/** Cumulative-coverage table: how much of the corpus the top-N lemmas account for. */
export function CorpusCoverage() {
  const steps = [100, 500, 1000, 2000];
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Most frequent…</th>
            <th>Tokens covered</th>
            <th>Share of the counted corpus</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((n) => {
            const {sum, pct} = cumulativeShare(n);
            return (
              <tr key={n}>
                <td>{fmt(n)} lemmas</td>
                <td>{fmt(sum)}</td>
                <td>{pct.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.caption}>
        Of {fmt(TOKENS)} tokens counted over {fmt(feed.stats.lemmasWithCount)} lemmas
        (Digital Corpus of Sanskrit, whole-corpus counts).
      </p>
    </div>
  );
}

/** Top-N lemma table: rank, lemma (IAST + SLP1), POS tag, count, per-10k rate. */
export default function CorpusFrequencyTop({n = 25}) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Lemma</th>
            <th>SLP1 key</th>
            <th>POS</th>
            <th>Tokens</th>
            <th>Per 10,000 tokens</th>
          </tr>
        </thead>
        <tbody>
          {feed.lemmas.slice(0, n).map((l) => (
            <tr key={l.slp1}>
              <td>{l.rank}</td>
              <td>
                <strong>{from_slp1(l.slp1)}</strong>
              </td>
              <td>
                <code>{l.slp1}</code>
              </td>
              <td>{l.grammar || '—'}</td>
              <td>{fmt(l.count)}</td>
              <td>{((10000 * l.count) / TOKENS).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Per-period share profile for chosen lemmas. Periods use the DCS-coded bucket
 * labels verbatim (see the page's legend + trust block for what they mean).
 */
export function PeriodProfiles({lemmas}) {
  const order = feed.periodOrder;
  const rows = lemmas
    .map((slp1) => feed.lemmas.find((l) => l.slp1 === slp1))
    .filter(Boolean);
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Lemma</th>
            <th>Rank</th>
            {order.map((p) => (
              <th key={p} className={styles.periodHead}>
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => {
            const total = order.reduce((s, p) => s + (l.periods?.[p] || 0), 0);
            return (
              <tr key={l.slp1}>
                <td>
                  <strong>{from_slp1(l.slp1)}</strong>
                </td>
                <td>{l.rank}</td>
                {order.map((p) => {
                  const pct = total ? (100 * (l.periods?.[p] || 0)) / total : 0;
                  return (
                    <td
                      key={p}
                      className={pct >= 25 ? styles.hot : pct >= 10 ? styles.warm : undefined}>
                      {pct ? `${pct.toFixed(0)}%` : '·'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.caption}>
        Share of each lemma&apos;s period-datable tokens per DCS period bucket
        (rows sum to 100%; &nbsp;·&nbsp; = no tokens in that bucket).
      </p>
    </div>
  );
}
