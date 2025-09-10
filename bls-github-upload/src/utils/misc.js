// utils/misc.js
export function dedupeBy(arr, key) {
  const seen = new Set();
  const out = [];
  for (const item of arr || []) {
    const k = item?.[key];
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}
