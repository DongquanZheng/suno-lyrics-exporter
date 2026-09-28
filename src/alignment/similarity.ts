import { normalizeForMatch } from '../utils/text';

function lcsLength(left: string[], right: string[]): number {
  const row = new Array<number>(right.length + 1).fill(0);
  for (const a of left) {
    let diagonal = 0;
    for (let column = 1; column <= right.length; column += 1) {
      const previous = row[column] ?? 0;
      row[column] = a === right[column - 1] ? diagonal + 1 : Math.max(row[column] ?? 0, row[column - 1] ?? 0);
      diagonal = previous;
    }
  }
  return row[right.length] ?? 0;
}

function editDistance(left: string[], right: string[]): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j] ?? 0;
      row[j] = left[i - 1] === right[j - 1]
        ? diagonal
        : 1 + Math.min(diagonal, row[j - 1] ?? 0, row[j] ?? 0);
      diagonal = previous;
    }
  }
  return row[right.length] ?? 0;
}

export function lineSimilarity(leftText: string, rightText: string): number {
  const left = normalizeForMatch(leftText);
  const right = normalizeForMatch(rightText);
  if (!left.length || !right.length) return 0;
  const lcs = lcsLength(left, right);
  const coverage = (2 * lcs) / (left.length + right.length);
  const edit = 1 - editDistance(left, right) / Math.max(left.length, right.length);
  return Math.max(0, Math.min(1, 0.68 * coverage + 0.32 * edit));
}

