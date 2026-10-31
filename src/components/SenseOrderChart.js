import React from 'react';
import data from '@site/src/data/pwg-sense-order.json';
import styles from './SenseOrderChart.module.css';

// Diverging bars for the PWG sense-order measurement page
// (docs/dictionaries/pwg-sense-order.mdx): Δτ = τ(control) − τ(PD) per control
// dictionary, computed at render time from the committed
// src/data/pwg-sense-order.json feed (vendored from csl-atlas by
// scripts/build-pwg-sense-order.mjs — consumed, not recomputed). Left of the
// zero line = the control orders its senses MORE chronologically than PD.
// The dashed marker is the pre-registered effect floor (data.rule.effectFloor)
// every control had to clear for the "historical principles" claim to stand.

const fmtTau = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3);

export default function SenseOrderChart() {
  const pdTau = data.pd.tau;
  const floor = data.rule.effectFloor;
  const rows = data.dictionaries
    .map((d) => ({
      code: d.code,
      name: d.name,
      deltaTau: d.deltaTau,
      ci: d.deltaCi,
    }))
    .sort((a, b) => a.deltaTau - b.deltaTau);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.deltaTau)), floor) * 1.15;
  const floorPct = (floor / maxAbs) * 50; // % of the full track right of centre

  return (
    <div className={styles.root}>
      <p className={styles.caption}>
        How far each control dictionary's sense-order tendency (Kendall τ) sits
        above or below PD's {pdTau.toFixed(2)} on the same clock. Left of the zero
        line = the control orders senses <em>more</em> chronologically than PD.
        The dashed rule is the pre-registered effect floor (+{floor.toFixed(2)}):
        the claim stood only if every control sat at or right of it. Outcome:{' '}
        <strong>{data.verdict.status}</strong>.
      </p>
      <div className={styles.bars}>
        {rows.map((r) => {
          const widthPct = (Math.abs(r.deltaTau) / maxAbs) * 50;
          const negative = r.deltaTau < 0;
          return (
            <div key={r.code} className={styles.barRow}>
              <span className={styles.barLabel} title={r.name}>
                {r.name}
              </span>
              <span className={styles.barTrack}>
                <span className={styles.zeroLine} aria-hidden="true" />
                <span className={styles.floorLine} style={{left: `${50 + floorPct}%`}} aria-hidden="true" />
                <span
                  className={negative ? styles.barNeg : styles.barPos}
                  style={
                    negative
                      ? {right: '50%', width: `${widthPct}%`}
                      : {left: '50%', width: `${widthPct}%`}
                  }
                />
                <span
                  className={styles.barValue}
                  style={
                    negative
                      ? {left: `calc(50% - ${widthPct}% )`, textAlign: 'right'}
                      : {left: `calc(50% + ${widthPct}% )`, textAlign: 'left'}
                  }
                >
                  {fmtTau(r.deltaTau)}
                  <span className={styles.barSecondary}>
                    {' '}
                    (CI {fmtTau(r.ci[0])}…{fmtTau(r.ci[1])})
                  </span>
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <p className={styles.axisNote}>
        PD itself is the zero line ({pdTau.toFixed(2)}); the dashed vertical is the
        +{floor.toFixed(2)} floor from the pre-registered rule.
      </p>
    </div>
  );
}
