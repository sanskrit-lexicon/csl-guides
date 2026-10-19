// Deterministic, idempotent option ordering for the quiz banks (H1387).
//
// The rule (from the H1387 record): indices are canonicalized BY OPTION TEXT
// first, and only then permuted by a mulberry32 PRNG seeded (FNV-1a) on the
// question key. Canonicalizing first is what buys idempotency: re-running
// recovers the same starting order however the array currently sits, so the
// output converges instead of churning the diff forever.
//
// The text-canonical step is also why a bilingual item must share ONE
// permutation: sorting "True"/"False" and "Верно"/"Неверно" independently
// yields different orders and silently decouples the two. The order computed
// for the first locale of an id is cached and reused for the rest, by
// normalize-quiz-answer-positions.mjs; build-level-quiz.mjs applies the same
// order to both locales of an item it generates.
//
// API:
//   canonicalOrder(values, key) -> number[]  permutation of 0..n-1; the source
//                                    index of each output position
//   applyOrder(values, order)   -> string[]  `values` laid out by `order`

// FNV-1a, 32-bit, over the UTF-8 bytes of the key.
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function fnv1a(str) {
  const bytes = new TextEncoder().encode(str);
  let h = FNV_OFFSET;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, FNV_PRIME);
  }
  return h >>> 0;
}

// mulberry32 — 32-bit PRNG, returns a float in [0, 1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Step 1 — canonical starting order: the source indices sorted by option text.
// `Array.prototype.sort` is stable, so equal texts keep their original order.
function canonicalByText(values) {
  return values
    .map((_, i) => i)
    .sort((a, b) => (values[a] < values[b] ? -1 : values[a] > values[b] ? 1 : 0));
}

// The canonical order for one option list. Deterministic in (values, key) and
// idempotent: canonicalOrder(canonicalOrder(values, key) applied to values,
// key) === canonicalOrder(values, key).
export function canonicalOrder(values, key) {
  const n = values.length;
  const order = canonicalByText(values);
  const rand = mulberry32(fnv1a(key));
  // Fisher-Yates, downward: for i = n-1 .. 1, swap i with j = floor(rand * (i+1)).
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

// Lay `values` out in the order `order` describes (order[k] = source index of
// the element at output position k).
export function applyOrder(values, order) {
  return order.map((i) => values[i]);
}
