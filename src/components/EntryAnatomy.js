import React from 'react';
import data from '@site/src/data/entry-anatomy.json';
import styles from './EntryAnatomy.module.css';

// "Anatomy of a dictionary entry" — the labelled-dissection teaching asset, one
// card per flagship CDSL dictionary. Data (cleaned token stream + part legend)
// is vendored by scripts/build-entry-anatomy.py over the /entry-anatomy producer
// skill (Uprava H791); this component only renders it. Part tints are translucent
// rgba overlays, so a single palette works in both light and dark themes. The
// entry text is real DOM text (crawlable) — not an image or iframe.

const COLOR = Object.fromEntries(data.parts.map((p) => [p.key, p.color]));
const LABEL = Object.fromEntries(data.parts.map((p) => [p.key, p.label]));

// Which dictionaries have a guide page to deep-link the card's source line to.
const DICT_PAGE = {mw: 'mw', pwg: 'pwg', ap90: 'ap90', gra: 'gra'};

function Token({part, text}) {
  if (part === 'gloss') {
    return <>{text}</>;
  }
  const color = COLOR[part] || '120,120,120';
  return (
    <span
      className={styles.part}
      data-part={part}
      style={{background: `rgba(${color}, 0.16)`}}
      title={LABEL[part] || part}
    >
      {text}
    </span>
  );
}

function Card({entry}) {
  const color = COLOR.headword || '80,140,255';
  const page = DICT_PAGE[entry.dict];
  return (
    <div className={styles.card}>
      <div className={styles.entry}>
        <span
          className={styles.part}
          style={{background: `rgba(${color}, 0.16)`}}
          title="Headword / lemma"
        >
          <span className={styles.head}>
            {entry.devanagari && <span className={styles.dev}>{entry.devanagari}</span>}{' '}
            <span className={styles.iast}>{entry.iast || entry.k2}</span>
          </span>
          {entry.homonym && <sup className={styles.hom}>{entry.homonym}</sup>}
        </span>{' '}
        {entry.tokens.map((t, i) => (
          <Token key={i} part={t.part} text={t.text} />
        ))}
      </div>
      <div className={styles.meta}>
        {page ? (
          <a href={page}>{entry.dict_name}</a>
        ) : (
          entry.dict_name
        )}
        {' · '}
        <span className={styles.metaDim}>
          L{entry.id} · p.&nbsp;{entry.page}
          {entry.truncated && ' · opening lines'}
        </span>
      </div>
    </div>
  );
}

function Legend() {
  // Only show parts that actually occur in at least one card.
  const used = new Set(['headword']);
  for (const e of data.entries) {
    if (e.homonym) used.add('homonym');
    for (const t of e.tokens) used.add(t.part);
  }
  const rows = data.parts.filter((p) => used.has(p.key));
  return (
    <div className={styles.legend}>
      {rows.map((p) => (
        <div key={p.key} className={styles.legendRow}>
          <span
            className={styles.swatch}
            style={{background: `rgba(${p.color}, 0.85)`}}
          />
          <b>{p.label}</b>
          <span className={styles.legendDesc}>{p.desc}</span>
        </div>
      ))}
    </div>
  );
}

export default function EntryAnatomy() {
  return (
    <div className={styles.root}>
      {data.entries.map((e) => (
        <Card key={`${e.dict}-${e.id}`} entry={e} />
      ))}
      <Legend />
    </div>
  );
}
