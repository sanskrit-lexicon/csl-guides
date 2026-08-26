// Vedic-accent tables over src/data/vedic-accent.json (the H096-consumer feed:
// Casaretto et al. 2025 udatta-marked Rigveda word-split joined against the DCS
// top-2000 frequency layer). All numbers are computed from the committed feed at
// render time so the page can never drift from the artifact. SSR-safe: pure
// markup, no client state, no network calls. IAST display via the vendored
// sanskrit-util; the accented FORMS come straight out of the upstream export.
import React from 'react';
import feed from '@site/src/data/vedic-accent.json';
import {from_slp1} from '@site/src/vendor/sanskrit-util.js';
import styles from './VedicAccent.module.css';

const fmt = (n) => n.toLocaleString('en-US');

/** Headline stats: how much of the Classical corpus core is already in the RV slice. */
export function VedicAccentStats() {
  const s = feed.stats;
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Measure</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rigveda stanzas in the accented word-split</td>
            <td>{fmt(s.rvStanzas)}</td>
          </tr>
          <tr>
            <td>Word tokens carrying a lemma annotation</td>
            <td>{fmt(s.rvTokens)}</td>
          </tr>
          <tr>
            <td>Top-2,000 DCS lemmas attested in the Rigveda slice</td>
            <td>
              {fmt(s.joinedLemmas)} <span className={styles.muted}>of {fmt(s.dcsTopN)}</span>
            </td>
          </tr>
          <tr>
            <td>Share of all DCS tokens those lemmas carry</td>
            <td>{(100 * s.joinedDcsTokenShare).toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>
      <p className={styles.caption}>
        Join: VedaWeb lemma keys normalised and matched against the SLP1-keyed
        top-{fmt(s.dcsTopN)} DCS lemmas — see the trust block for what the join misses.
      </p>
    </div>
  );
}

/**
 * The most frequent RV-attested classical lemmas with their udatta-marked forms.
 * Accents render exactly as the Zurich/VedaWeb transliteration writes them.
 */
export default function VedicAccentTop({n = 20}) {
  const rows = feed.lemmas.slice(0, n);
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>DCS rank</th>
            <th>Lemma</th>
            <th>SLP1 key</th>
            <th>RV tokens</th>
            <th>Attested accented forms</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.slp1}>
              <td>{l.rank}</td>
              <td>
                <strong>{from_slp1(l.slp1)}</strong>
              </td>
              <td>
                <code>{l.slp1}</code>
              </td>
              <td>{fmt(l.rvTokens)}</td>
              <td className={styles.forms}>{l.forms.join(' · ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.caption}>
        Forms are verbatim from the Casaretto et&nbsp;al. accented word-split
        (acute&nbsp;&nbsp;́&nbsp;&nbsp;= udātta). Up to three shortest distinct forms per lemma.
      </p>
    </div>
  );
}

/** Named lookups for prose discussion (silent skip for unjoined stems). */
export function VedicAccentLemmas({lemmas}) {
  const rows = lemmas
    .map((slp1) => feed.lemmas.find((l) => l.slp1 === slp1))
    .filter(Boolean);
  if (!rows.length) return null;
  return (
    <ul className={styles.proseList}>
      {rows.map((l) => (
        <li key={l.slp1}>
          <strong>{from_slp1(l.slp1)}</strong>{' '}
          <code>{l.slp1}</code> — DCS rank {l.rank}, {fmt(l.rvTokens)} RV tokens, e.g.&nbsp;
          <em className={styles.form}>{l.forms[0]}</em>
        </li>
      ))}
    </ul>
  );
}
