import React, {useEffect, useState} from 'react';
import feed from '@site/src/data/changelog-feed.json';
import styles from './ChangelogFeed.module.css';

// Home-page "Latest from our changelog" card — the GitHub-homepage-style
// widget (dot timeline, relative timestamps, "View changelog →").
//
// Data: src/data/changelog-feed.json — generated from CHANGELOG.md by
// scripts/build-changelog-feed.mjs (`npm run build:changelog-feed`; CI
// enforces freshness with `npm run check:changelog-feed`). Never hand-edit
// the JSON.
//
// Timestamps: the SSR HTML and the first client render BOTH show the
// absolute date — a pure function of the entry, no Date.now() during
// render — and a mount-only effect swaps in the relative label ("2 days
// ago"). Rendering the relative label during SSR would compute a
// build-time value on the server and a view-time value on the client,
// hydrating into a mismatch — the exact React #418 class this site
// already carries one instance of (.ai_state.md).

const SHOW = 4;
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatAbsolute(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Calendar days between the entry date and today, in the VIEWER's
// timezone (both ends as local midnights; Math.round absorbs the DST
// hour). Date-only entries can't honestly say "N hours ago".
function daysAgo(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - then) / 86400000);
}

function formatRelative(iso) {
  const n = daysAgo(iso);
  if (n <= 0) return 'today';
  if (n === 1) return 'yesterday';
  if (n < 7) return `${n} days ago`;
  if (n < 14) return 'last week';
  if (n < 60) return `${Math.floor(n / 7)} weeks ago`;
  if (n < 365) return `${Math.floor(n / 30)} months ago`;
  return formatAbsolute(iso);
}

// Each entry deep-links to its release heading on the GitHub blob. The
// `user-content-` prefix targets the heading's real DOM id: it resolves
// with or without GitHub's client-side anchor script (the bare slug
// GitHub prints in its own hrefs only resolves THROUGH that script), and
// it is the fragment a link checker sees against the fetched HTML.
function entryHref(entry) {
  return `${feed.sourceUrl}#user-content-${entry.anchor}`;
}

export default function ChangelogFeed() {
  const entries = (feed.entries || []).slice(0, SHOW);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (entries.length === 0) return null;

  return (
    <section className={styles.card} aria-labelledby="changelog-feed-title">
      <h2 id="changelog-feed-title" className={styles.heading}>
        Latest from our changelog
      </h2>
      <ol className={styles.list}>
        {entries.map((entry, i) => (
          <li key={`${entry.version}-${entry.date}-${i}`} className={styles.item}>
            <time className={styles.time} dateTime={entry.date}>
              {mounted ? formatRelative(entry.date) : formatAbsolute(entry.date)}
            </time>
            <a
              className={styles.title}
              href={entryHref(entry)}
              target="_blank"
              rel="noreferrer"
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
      <a className={styles.footer} href={feed.sourceUrl} target="_blank" rel="noreferrer">
        View changelog <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
