import React from 'react';
import data from '@site/src/data/citation-sources.json';
import styles from './CitationSources.module.css';

// Two SSR-safe figures for the citation-graph explainer page
// (docs/dictionaries/citation-graph.mdx), both computed at render time from
// the committed src/data/citation-sources.json feed (vendored from csl-atlas
// by scripts/build-atlas-viz.mjs — consumed, not recomputed). Same single-hue
// bar style and CSS module as CitationSources (H279-validated palette).

const fmt = (n) => n.toLocaleString('en-US');

// Who feeds the graph: resolved <ls> citations per dictionary, with each
// dictionary's distinct-text count as a secondary label.
export default function CitationGraphShare() {
  const rows = Object.entries(data.dictTotals)
    .map(([dict, cites]) => ({dict, cites, texts: data.dictTextCounts[dict]}))
    .sort((a, b) => b.cites - a.cites);
  const maxValue = rows[0].cites;
  const total = data.stats.totalResolvedCites;

  return (
    <div className={styles.root}>
      <p className={styles.caption}>
        Resolved <code>&lt;ls&gt;</code> citations per dictionary —{' '}
        {fmt(total)} across the {data.stats.dictCount} covered dictionaries.
      </p>
      <div className={styles.bars}>
        {rows.map((r) => (
          <div key={r.dict} className={styles.barRow}>
            <span className={styles.barLabel} title={r.dict.toUpperCase()}>
              {r.dict.toUpperCase()}
            </span>
            <span className={styles.barTrack}>
              <span
                className={styles.bar}
                style={{width: `${Math.max((r.cites / maxValue) * 100, 0.5)}%`}}
              />
              <span className={styles.barValue}>
                {fmt(r.cites)}
                <span className={styles.barSecondary}>
                  {' '}
                  · {((r.cites / total) * 100).toFixed(1)}% · {fmt(r.texts)} texts
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>
      <details className={styles.tableView}>
        <summary>Data table</summary>
        <table>
          <thead>
            <tr>
              <th>Dictionary</th>
              <th>Resolved citations</th>
              <th>Share of graph</th>
              <th>Distinct texts cited</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dict}>
                <td>{r.dict.toUpperCase()}</td>
                <td className={styles.num}>{fmt(r.cites)}</td>
                <td className={styles.num}>{((r.cites / total) * 100).toFixed(1)}%</td>
                <td className={styles.num}>{fmt(r.texts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// The long tail: how many canonical texts are cited by exactly n of the 11
// covered dictionaries.
export function CitationSpread() {
  const rows = data.spread;
  const maxValue = Math.max(...rows.map((r) => r.texts));
  const totalTexts = data.stats.nodeCount;

  return (
    <div className={styles.root}>
      <p className={styles.caption}>
        Breadth of citation: of the {fmt(totalTexts)} canonical texts,{' '}
        {fmt(rows[0].texts)} appear in only one dictionary.
      </p>
      <div className={styles.bars}>
        {rows.map((r) => (
          <div key={r.nDicts} className={styles.barRow}>
            <span className={styles.barLabel}>
              {r.nDicts} {r.nDicts === 1 ? 'dictionary' : 'dictionaries'}
            </span>
            <span className={styles.barTrack}>
              <span
                className={styles.bar}
                style={{width: `${Math.max((r.texts / maxValue) * 100, 0.5)}%`}}
              />
              <span className={styles.barValue}>
                {fmt(r.texts)} texts
                <span className={styles.barSecondary}>
                  {' '}
                  · {((r.texts / totalTexts) * 100).toFixed(1)}%
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>
      <details className={styles.tableView}>
        <summary>Data table</summary>
        <table>
          <thead>
            <tr>
              <th>Cited by exactly n dictionaries</th>
              <th>Canonical texts</th>
              <th>Share of texts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.nDicts}>
                <td>{r.nDicts}</td>
                <td className={styles.num}>{fmt(r.texts)}</td>
                <td className={styles.num}>{((r.texts / totalTexts) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
