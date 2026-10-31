import React from 'react';
import data from '@site/src/data/corpus-frequency.json';
import styles from './ZipfCoverage.module.css';

// Cumulative corpus-coverage curve for docs/users/first-sanskrit-sentence.mdx:
// share of all counted DCS tokens covered by the top-N most frequent lemmas,
// computed at render time from the committed src/data/corpus-frequency.json
// feed (vendored from kosha by scripts/build-corpus-frequency.mjs — consumed,
// not recomputed). Log-scaled rank axis; milestones derive from the feed, so
// the printed percentages always match the curve.

const W = 720;
const H = 300;
const PAD_L = 46;
const PAD_R = 150;
const PAD_T = 18;
const PAD_B = 36;

export default function ZipfCoverage() {
  const total = data.stats.tokensCounted;
  const lemmas = data.lemmas; // frequency order, rank 1 first
  const n = lemmas.length;

  const points = [];
  let cum = 0;
  lemmas.forEach((l, i) => {
    cum += l.count;
    points.push({rank: i + 1, pct: (cum / total) * 100});
  });

  const x = (rank) => PAD_L + (Math.log10(rank) / Math.log10(n)) * (W - PAD_L - PAD_R);
  const y = (pct) => PAD_T + (1 - pct / 100) * (H - PAD_T - PAD_B);

  // ~120 log-spaced samples keep the path light without visibly bending it.
  const sampleRanks = [];
  for (let s = 0; s <= 120; s++) {
    sampleRanks.push(Math.max(1, Math.round(Math.pow(n, s / 120))));
  }
  const pathRanks = [...new Set([...sampleRanks, 1, n])].sort((a, b) => a - b);
  const path = pathRanks
    .map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r).toFixed(1)},${y(points[r - 1].pct).toFixed(1)}`)
    .join(' ');
  const area = `${path} L${x(n).toFixed(1)},${y(0).toFixed(1)} L${x(1).toFixed(1)},${y(0).toFixed(1)} Z`;

  const milestones = [25, 100, n].map((rank) => ({rank, ...points[rank - 1]}));

  return (
    <div className={styles.root}>
      <p className={styles.caption}>
        The {n.toLocaleString('en-US')} most frequent corpus lemmas cover{' '}
        {points[n - 1].pct.toFixed(1)}% of all {(total / 1e6).toFixed(2)} million
        counted tokens — the top 25 alone cover {points[24].pct.toFixed(1)}%, the
        top 100 {points[99].pct.toFixed(1)}%. Frequency rank is log-scaled.
      </p>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Cumulative corpus coverage by frequency rank"
      >
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}>
            <line className={styles.grid} x1={PAD_L} x2={W - PAD_R} y1={y(p)} y2={y(p)} />
            <text className={styles.tick} x={PAD_L - 6} y={y(p) + 3} textAnchor="end">
              {p}%
            </text>
          </g>
        ))}
        {[1, 10, 100, 1000, n].map((r) => (
          <text key={r} className={styles.tick} x={x(r)} y={H - PAD_B + 16} textAnchor="middle">
            {r.toLocaleString('en-US')}
          </text>
        ))}
        <text className={styles.tick} x={(PAD_L + W - PAD_R) / 2} y={H - 4} textAnchor="middle">
          top-N words by frequency rank
        </text>
        <path className={styles.area} d={area} />
        <path className={styles.line} d={path} />
        {milestones.map((m) => (
          <g key={m.rank}>
            <circle className={styles.dot} cx={x(m.rank)} cy={y(m.pct)} r={4} />
            <text
              className={styles.dotLabel}
              x={x(m.rank) + 8}
              y={y(m.pct) - 7}
            >
              top {m.rank.toLocaleString('en-US')} · {m.pct.toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
