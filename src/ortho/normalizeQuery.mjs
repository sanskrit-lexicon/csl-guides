// Browser wiring for ortho-drift query normalization (H3340).
//
// Static JSON import is webpack-friendly; the shared logic lives in
// orthoQueryCore.mjs so Node verification scripts exercise the exact same
// expansion code path against the same committed feed.
import feed from '../data/ortho-query-expansions.json';
import {makeOrthoQueryNormalizer} from './orthoQueryCore.mjs';

// Bundle sentinel: scripts/verify-ortho-query.mjs greps the built assets for
// this literal to prove the normalized components are what actually shipped.
export const ORTHO_QUERY_NORMALIZER = 'h3340-ortho-query-normalizer';

export const normalizeOrthoQuery = makeOrthoQueryNormalizer(feed.expansions || {});
