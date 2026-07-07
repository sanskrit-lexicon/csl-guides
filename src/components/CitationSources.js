import React, {useState} from 'react';
import data from '@site/src/data/citation-sources.json';
import catalog from '@site/src/data/dictionaries.json';
import styles from './CitationSources.module.css';

// Which classical texts each dictionary quotes, and how often — a bar view
// over the csl-atlas <ls> citation-frequency graph (vendored by
// scripts/build-atlas-viz.mjs into src/data/citation-sources.json; consumed,
// not recomputed). One series → single hue, no legend; counts are
// direct-labeled at each bar end (text in ink tokens, not the series color).

const OVERVIEW = 'all';

function dictLabel(code) {
  for (const g of catalog.groups) {
    for (const item of g.items) {
      if (item.code.toLowerCase() === code) return `${item.code} — ${item.title} (${item.year})`;
    }
  }
  if (code === 'pwkvn') {
    return 'PWKVN — Böhtlingk, Nachträge und Verbesserungen to PW';
  }
  return code.toUpperCase();
}

const fmt = (n) => n.toLocaleString('en-US');

function Bars({rows, maxValue, secondary}) {
  return (
    <div className={styles.bars}>
      {rows.map((row) => (
        <div key={row.text} className={styles.barRow}>
          <span className={styles.barLabel} title={row.text}>
            {row.text}
          </span>
          <span className={styles.barTrack}>
            <span
              className={styles.bar}
              style={{width: `${Math.max((row.value / maxValue) * 100, 0.5)}%`}}
            />
            <span className={styles.barValue}>
              {fmt(row.value)}
              {secondary && row.nDicts != null && (
                <span className={styles.barSecondary}> · in {row.nDicts} dicts</span>
              )}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CitationSources() {
  const [selected, setSelected] = useState(OVERVIEW);
  const dicts = Object.keys(data.perDict).sort();

  const rows =
    selected === OVERVIEW
      ? data.overall.map((n) => ({text: n.text, value: n.totalCites, nDicts: n.nDicts}))
      : data.perDict[selected].map((e) => ({text: e.text, value: e.count}));
  const maxValue = Math.max(...rows.map((r) => r.value));

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <label className={styles.field}>
          Dictionary
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value={OVERVIEW}>All dictionaries — most-cited texts overall</option>
            {dicts.map((d) => (
              <option key={d} value={d}>
                {dictLabel(d)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={styles.caption}>
        {selected === OVERVIEW ? (
          <>
            Top {rows.length} of {fmt(data.stats.nodeCount)} canonical texts, by total resolved{' '}
            <code>&lt;ls&gt;</code> citations across the {data.stats.dictCount} covered
            dictionaries ({fmt(data.stats.totalResolvedCites)} resolved citations).
          </>
        ) : (
          <>
            Top {rows.length} of {fmt(data.dictTextCounts[selected])} cited texts in{' '}
            {dictLabel(selected)} — {fmt(data.dictTotals[selected])} resolved citations.
          </>
        )}
      </p>

      <Bars rows={rows} maxValue={maxValue} secondary={selected === OVERVIEW} />

      <details className={styles.tableView}>
        <summary>Data table</summary>
        <table>
          <thead>
            <tr>
              <th>Text</th>
              <th>Citations</th>
              {selected === OVERVIEW && <th>Dictionaries citing it</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.text}>
                <td>{r.text}</td>
                <td className={styles.num}>{fmt(r.value)}</td>
                {selected === OVERVIEW && <td className={styles.num}>{r.nDicts}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
