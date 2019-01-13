export function findRange(array) {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  array.forEach(v => {
    if (v > max) max = v;
    if (v < min) min = v;
  });
  return { min, max };
}
