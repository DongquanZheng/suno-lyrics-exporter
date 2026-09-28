import type { AlignedLine, AlignmentMatch, AlignmentResult } from '../types';
import { splitLyricLines } from '../utils/text';
import { lineSimilarity } from './similarity';

const MIN_RELIABLE_SCORE = 0.42;
const SKIP_ORIGINAL = -0.36;
const SKIP_ALIGNED = -0.24;

interface Cell {
  score: number;
  action: 'match' | 'skip-original' | 'skip-aligned' | 'start';
}

export function alignOriginalLyrics(originalLyrics: string, aligned: AlignedLine[], includeSectionLabels = false): AlignmentResult {
  const original = splitLyricLines(originalLyrics, includeSectionLabels);
  const width = aligned.length + 1;
  const cells: Cell[] = Array.from({ length: (original.length + 1) * width }, () => ({ score: Number.NEGATIVE_INFINITY, action: 'start' }));
  const at = (i: number, j: number) => cells[i * width + j]!;
  at(0, 0).score = 0;
  for (let i = 1; i <= original.length; i += 1) cells[i * width] = { score: i * SKIP_ORIGINAL, action: 'skip-original' };
  for (let j = 1; j <= aligned.length; j += 1) cells[j] = { score: j * SKIP_ALIGNED, action: 'skip-aligned' };

  for (let i = 1; i <= original.length; i += 1) {
    for (let j = 1; j <= aligned.length; j += 1) {
      const similarity = lineSimilarity(original[i - 1]!, aligned[j - 1]!.text);
      const match = at(i - 1, j - 1).score + (similarity >= MIN_RELIABLE_SCORE ? similarity : similarity - 0.8);
      const skipOriginal = at(i - 1, j).score + SKIP_ORIGINAL;
      const skipAligned = at(i, j - 1).score + SKIP_ALIGNED;
      if (match >= skipOriginal && match >= skipAligned) cells[i * width + j] = { score: match, action: 'match' };
      else if (skipOriginal >= skipAligned) cells[i * width + j] = { score: skipOriginal, action: 'skip-original' };
      else cells[i * width + j] = { score: skipAligned, action: 'skip-aligned' };
    }
  }

  const matches: AlignmentMatch[] = [];
  let i = original.length;
  let j = aligned.length;
  while (i > 0 || j > 0) {
    const action = at(i, j).action;
    if (action === 'match' && i > 0 && j > 0) {
      const score = lineSimilarity(original[i - 1]!, aligned[j - 1]!.text);
      if (score >= MIN_RELIABLE_SCORE) matches.push({ originalIndex: i - 1, alignedIndex: j - 1, score });
      i -= 1;
      j -= 1;
    } else if (action === 'skip-original' && i > 0) i -= 1;
    else if (j > 0) j -= 1;
    else break;
  }
  matches.reverse();
  const matchedOriginal = new Set(matches.map((match) => match.originalIndex));
  const missing = original.flatMap((text, index) => matchedOriginal.has(index) ? [] : [{ index, text }]);
  const matchedLines = matches.flatMap((match) => {
    const timing = aligned[match.alignedIndex]!;
    return timing.start !== null && timing.end !== null
      ? [{ text: original[match.originalIndex]!, start: timing.start, end: timing.end }]
      : [];
  });
  return { matches, missing, matchedLines, totalOriginalLines: original.length };
}

