import React, {useMemo, useState} from 'react';
import data from '@site/src/data/cladogram.json';
import catalog from '@site/src/data/dictionaries.json';
import styles from './Cladogram.module.css';

// Read-only rendering of the csl-atlas headword-overlap cladogram
// (data/sanhw1_cladogram.newick — UPGMA over pairwise Jaccard distances
// between per-dictionary headword sets; vendored by scripts/build-atlas-viz.mjs).
// Consumed, not recomputed: this component only parses the Newick string and
// lays it out; hovering a dictionary highlights its path to the root.
//
// Note on the Newick encoding: lex_l2_cladogram.py writes each child's branch
// "length" as the JOIN HEIGHT of its parent (a UPGMA convention), so a node's
// height is read off any of its children's length attribute — leaves sit at 0.

function parseNewick(s) {
  let i = 0;
  function node() {
    const n = {children: []};
    if (s[i] === '(') {
      i++; // (
      n.children.push(node());
      while (s[i] === ',') {
        i++;
        n.children.push(node());
      }
      i++; // )
    } else {
      let name = '';
      while (i < s.length && !':,()'.includes(s[i]) && s[i] !== ';') name += s[i++];
      n.name = name;
    }
    if (s[i] === ':') {
      i++;
      let len = '';
      while (i < s.length && !',()'.includes(s[i]) && s[i] !== ';') len += s[i++];
      n.len = parseFloat(len);
    }
    return n;
  }
  return node();
}

function layout(root) {
  const leaves = [];
  const segments = []; // {x1,y1,x2,y2, leafSet}
  const maxH = root.children[0]?.len ?? 0.5;

  function height(n) {
    return n.children.length ? n.children[0].len : 0;
  }

  function walk(n) {
    if (!n.children.length) {
      n.leafSet = new Set([n.name]);
      n.y = leaves.length;
      leaves.push(n);
      n.h = 0;
      return;
    }
    n.leafSet = new Set();
    for (const c of n.children) {
      walk(c);
      for (const l of c.leafSet) n.leafSet.add(l);
    }
    n.y = n.children.reduce((s, c) => s + c.y, 0) / n.children.length;
    n.h = height(n);
    // vertical connector spanning the children, at this node's height
    const ys = n.children.map((c) => c.y);
    segments.push({
      kind: 'v',
      h: n.h,
      y1: Math.min(...ys),
      y2: Math.max(...ys),
      leafSet: n.leafSet,
    });
    // horizontal branch from each child out to this node's height
    for (const c of n.children) {
      segments.push({kind: 'h', h1: c.h, h2: n.h, y: c.y, leafSet: c.leafSet});
    }
  }
  walk(root);
  return {leaves, segments, maxH};
}

const GROUP_INDEX = (() => {
  const order = [
    'Sanskrit-English',
    'Specialized',
    'Sanskrit-Sanskrit',
    'Sanskrit-German',
    'English-Sanskrit',
    'Sanskrit-French',
    'Sanskrit-Latin',
  ];
  const map = {};
  for (const g of catalog.groups) {
    for (const item of g.items) map[item.code] = order.indexOf(g.name) + 1;
  }
  map.PWKVN = order.indexOf('Sanskrit-German') + 1; // Böhtlingk's Nachträge to PW — not a catalog row
  return map;
})();

const ROW = 19;
const M = {top: 12, right: 74, bottom: 34, left: 12};
const PLOT_W = 560;

export default function Cladogram() {
  const {leaves, segments, maxH} = useMemo(() => layout(parseNewick(data.newick)), []);
  const [hovered, setHovered] = useState(null);

  const W = M.left + PLOT_W + M.right;
  const H = M.top + leaves.length * ROW + M.bottom;
  const x = (h) => M.left + ((maxH - h) / maxH) * PLOT_W;
  const y = (row) => M.top + row * ROW + ROW / 2;

  const axisTicks = [0.5, 0.4, 0.3, 0.2, 0.1, 0];

  return (
    <div className={styles.root}>
      <div className={styles.chartWrap}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-label="Dendrogram: UPGMA clustering of the Cologne dictionaries by shared headwords. Dictionaries joining nearer the right share more of their headword lists."
        >
          {axisTicks
            .filter((t) => t <= maxH)
            .map((t) => (
              <g key={t}>
                <line
                  className={styles.gridline}
                  x1={x(t)}
                  x2={x(t)}
                  y1={M.top}
                  y2={M.top + leaves.length * ROW}
                />
                <text className={styles.tick} x={x(t)} y={H - 18} textAnchor="middle">
                  {t}
                </text>
              </g>
            ))}
          <text className={styles.axisLabel} x={M.left + PLOT_W / 2} y={H - 4} textAnchor="middle">
            join height (Jaccard distance between headword sets — smaller = more shared)
          </text>

          {segments.map((s, idx) => {
            const hot = hovered && s.leafSet.has(hovered);
            const cls = hot ? styles.branchHot : styles.branch;
            return s.kind === 'v' ? (
              <line key={idx} className={cls} x1={x(s.h)} x2={x(s.h)} y1={y(s.y1)} y2={y(s.y2)} />
            ) : (
              <line key={idx} className={cls} x1={x(s.h1)} x2={x(s.h2)} y1={y(s.y)} y2={y(s.y)} />
            );
          })}

          {leaves.map((l) => (
            <g
              key={l.name}
              className={styles.leaf}
              onMouseEnter={() => setHovered(l.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                className={styles.leafHit}
                x={x(0)}
                y={y(l.y) - ROW / 2}
                width={M.right}
                height={ROW}
              />
              <rect
                className={styles.leafChip}
                data-group={GROUP_INDEX[l.name] || 0}
                x={x(0) + 3}
                y={y(l.y) - 4.5}
                width={9}
                height={9}
                rx={2}
              />
              <text
                className={hovered === l.name ? styles.leafLabelHot : styles.leafLabel}
                x={x(0) + 17}
                y={y(l.y) + 4}
              >
                {l.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className={styles.note}>
        Chip color = catalog language group (see the landscape chart above). Hover a code to
        trace its path to the root. Tight pairs (SHS–WIL, YAT, CAE–CCS, PW–PWG) join at low
        distance — heavy headword-list inheritance; the singleton indexes and koshas on the
        outer rim share few headwords with anything.
      </p>
    </div>
  );
}
