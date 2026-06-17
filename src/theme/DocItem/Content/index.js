import React from 'react';
import Content from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

// Wraps the default doc content to show the page's git "last updated" date in the
// top-right corner of the article (above the H1), instead of only in the page footer.
// `metadata.lastUpdatedAt` is a millisecond timestamp, populated because
// `showLastUpdateTime` is enabled in docusaurus.config.js. We format with a fixed
// en-US/UTC locale so the server and client render identical text (no hydration
// mismatch); the default footer copy is hidden via .theme-last-updated in custom.css.
export default function ContentWrapper(props) {
  const {metadata} = useDoc();
  const {lastUpdatedAt} = metadata;
  const formatted = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : null;

  return (
    <>
      {formatted && (
        <div className="docPageLastUpdated">
          <time dateTime={new Date(lastUpdatedAt).toISOString()}>
            Last updated: {formatted}
          </time>
        </div>
      )}
      <Content {...props} />
    </>
  );
}
