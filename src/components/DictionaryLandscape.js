import React, {useMemo, useRef, useState} from 'react';
import catalog from '@site/src/data/dictionaries.json';
import atlas from '@site/src/data/atlas-extract.json';
import styles from './DictionaryLandscape.module.css';

// The dictionary-landscape scatter: every catalog dictionary placed by
// publication year (x) and headword novelty (y = % of its distinct lemmas
// found in no other CDSL dictionary, csl-atlas OBS-R), bubble area = distinct
// lemmas, color = catalog language group. Joins the generated catalog
// (src/data/dictionaries.json) with the vendored csl-atlas extract
// (src/data/atlas-extract.json) at render time — nothing is recomputed here.
//
// Colors are assigned to groups in a FIXED order (identity, never rank) from
// the palette validated in both modes; groups with sub-3:1 light-surface
// contrast are relieved by direct labels + the table view below the chart.

export const GROUP_ORDER = [
  'Sanskrit-English',
  'Specialized',
  'Sanskrit-Sanskrit',
  'Sanskrit-German',
  'English-Sanskrit',
  'Sanskrit-French',
  'Sanskrit-Latin',
];

function joinRows() {
  const rows = [];
  for (const g of catalog.groups) {
    for (const item of g.items) {
      const a = atlas.dicts[item.code.toLowerCase()];
      if (!a || !item.year) continue; // PD has no csl-orig source → no atlas row
      rows.push({
        code: item.code,
        title: item.title,
        group: g.name,
        year: Number(item.year),
        distinctLemmas: a.distinctLemmas,
        uniquePct: a.uniquePct,
        entries: a.entries,
      });
    }
  }
  return rows;
}

const W = 900;
const H = 520;
const M = {top: 16, right: 24, bottom: 46, left: 54};
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const X_DOMAIN = [1825, 2000];
const Y_DOMAIN = [0, 60];

const x = (year) => M.left + ((year - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])) * PW;
const y = (pct) => M.top + PH - (pct / Y_DOMAIN[1]) * PH;

export default function DictionaryLandscape() {
  const rows = useMemo(joinRows, []);
  const maxLemmas = useMemo(() => Math.max(...rows.map((r) => r.distinctLemmas)), [rows]);
  const r = (v) => 4 + 24 * Math.sqrt(v / maxLemmas);

  const [active, setActive] = useState(() => new Set(GROUP_ORDER));
  const [hover, setHover] = useState(null); // {row, px, py}
  const wrapRef = useRef(null);

  const toggle = (g) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  // Selective direct labels: the biggest and the most novel, not every point.
  const labeled = useMemo(() => {
    const bySize = [...rows].sort((a, b) => b.distinctLemmas - a.distinctLemmas).slice(0, 8);
    const byNovelty = [...rows].sort((a, b) => b.uniquePct - a.uniquePct).slice(0, 5);
    return new Set([...bySize, ...byNovelty].map((d) => d.code));
  }, [rows]);

  const visible = rows.filter((d) => active.has(d.group));
  // Draw large bubbles first so small ones stay hoverable on top.
  const drawOrder = [...visible].sort((a, b) => b.distinctLemmas - a.distinctLemmas);

  const onEnter = (row) => (evt) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const svgBox = evt.currentTarget.ownerSVGElement.getBoundingClientRect();
    const scale = svgBox.width / W;
    setHover({
      row,
      px: svgBox.left - box.left + x(row.year) * scale,
      py: svgBox.top - box.top + (y(row.uniquePct) - r(row.distinctLemmas)) * scale,
    });
  };

  const xTicks = [1825, 1850, 1875, 1900, 1925, 1950, 1975, 2000];
  const yTicks = [0, 10, 20, 30, 40, 50, 60];
  const fmt = (n) => n.toLocaleString('en-US');

  return (
    <div className={styles.root}>
      <div className={styles.legend} role="group" aria-label="Filter by language group">
        {GROUP_ORDER.map((g) => {
          const n = rows.filter((d) => d.group === g).length;
          return (
            <label key={g} className={styles.legendItem} data-off={!active.has(g) || undefined}>
              <input
                type="checkbox"
                checked={active.has(g)}
                onChange={() => toggle(g)}
              />
              <span className={styles.chip} data-group={GROUP_ORDER.indexOf(g) + 1} />
              {g} <span className={styles.count}>({n})</span>
            </label>
          );
        })}
      </div>

      <div className={styles.chartWrap} ref={wrapRef}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-label="Scatter chart: each Cologne dictionary by publication year and share of headwords unique to it; bubble size shows distinct lemmas; color shows language group."
        >
          {/* grid + axes */}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line className={styles.grid} x1={M.left} x2={M.left + PW} y1={y(t)} y2={y(t)} />
              <text className={styles.tick} x={M.left - 8} y={y(t) + 4} textAnchor="end">
                {t}%
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={`x${t}`} className={styles.tick} x={x(t)} y={M.top + PH + 20} textAnchor="middle">
              {t}
            </text>
          ))}
          <line className={styles.axis} x1={M.left} x2={M.left + PW} y1={y(0)} y2={y(0)} />
          <text className={styles.axisLabel} x={M.left + PW / 2} y={H - 6} textAnchor="middle">
            publication year
          </text>
          <text
            className={styles.axisLabel}
            transform={`translate(14 ${M.top + PH / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            headwords unique to this dictionary (%)
          </text>

          {drawOrder.map((d) => (
            <circle
              key={d.code}
              className={styles.dot}
              data-group={GROUP_ORDER.indexOf(d.group) + 1}
              cx={x(d.year)}
              cy={y(d.uniquePct)}
              r={r(d.distinctLemmas)}
              onMouseEnter={onEnter(d)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${d.code} — ${d.title}`}</title>
            </circle>
          ))}
          {visible
            .filter((d) => labeled.has(d.code))
            .map((d) => (
              <text
                key={`l${d.code}`}
                className={styles.dotLabel}
                x={x(d.year)}
                y={y(d.uniquePct) - r(d.distinctLemmas) - 4}
                textAnchor="middle"
              >
                {d.code}
              </text>
            ))}
        </svg>

        {hover && (
          <div className={styles.tooltip} style={{left: hover.px, top: hover.py}}>
            <strong>
              {hover.row.code} · {hover.row.year}
            </strong>
            <div className={styles.tooltipTitle}>{hover.row.title}</div>
            <div>{hover.row.group}</div>
            <div>
              {fmt(hover.row.distinctLemmas)} distinct lemmas · {fmt(hover.row.entries)} entries
            </div>
            <div>
              <strong>{hover.row.uniquePct}%</strong> of headwords in no other dictionary
            </div>
          </div>
        )}
      </div>

      <p className={styles.note}>
        Bubble area = distinct lemma count (largest: MW, {fmt(maxLemmas)}). Novelty is a{' '}
        <em>floor</em> — a shared headword is independent attestation in each dictionary, not
        necessarily a copy.
      </p>

      <details className={styles.tableView}>
        <summary>Data table ({rows.length} dictionaries)</summary>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Dictionary</th>
              <th>Group</th>
              <th>Year</th>
              <th>Distinct lemmas</th>
              <th>Unique %</th>
              <th>Entries</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => b.uniquePct - a.uniquePct)
              .map((d) => (
                <tr key={d.code}>
                  <td>{d.code}</td>
                  <td>{d.title}</td>
                  <td>{d.group}</td>
                  <td>{d.year}</td>
                  <td className={styles.num}>{fmt(d.distinctLemmas)}</td>
                  <td className={styles.num}>{d.uniquePct}%</td>
                  <td className={styles.num}>{fmt(d.entries)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
