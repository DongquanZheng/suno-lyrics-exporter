import type { AlignedLine, WordTiming } from '../types';
import { cleanText, isNonLyricInstruction, isSectionLabel } from '../utils/text';

function finite(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rawLines(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.aligned_lyrics)) return root.aligned_lyrics;
  if (root.data && typeof root.data === 'object' && Array.isArray((root.data as Record<string, unknown>).aligned_lyrics)) {
    return (root.data as Record<string, unknown>).aligned_lyrics as unknown[];
  }
  return [];
}

function parseWords(value: unknown): WordTiming[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): WordTiming[] => {
    if (!entry || typeof entry !== 'object') return [];
    const word = entry as Record<string, unknown>;
    const start = finite(word.start_s ?? word.start);
    const end = finite(word.end_s ?? word.end);
    if (start === null || end === null || end <= start) return [];
    return [{ text: cleanText(word.text ?? word.word), start, end }];
  });
}

export function getAlignedLyrics(payload: unknown, includeSectionLabels = false): AlignedLine[] {
  return rawLines(payload).flatMap((entry): AlignedLine[] => {
    if (!entry || typeof entry !== 'object') return [];
    const row = entry as Record<string, unknown>;
    const words = parseWords(row.words);
    const fromWords = words.map((word) => word.text).join('');
    const text = cleanText(row.text ?? row.word ?? fromWords);
    if (!text || isNonLyricInstruction(text) || (!includeSectionLabels && isSectionLabel(text))) return [];
    const lineStart = finite(row.start_s ?? row.start);
    const lineEnd = finite(row.end_s ?? row.end);
    const start = words.length ? Math.min(...words.map((word) => word.start)) : lineStart;
    const end = words.length ? Math.max(...words.map((word) => word.end)) : lineEnd;
    const section = cleanText(row.section);
    return [{ text, start, end, words, ...(section ? { section } : {}) }];
  });
}

export function countAlignedWords(lines: AlignedLine[]): number {
  return lines.reduce((total, line) => total + line.words.length, 0);
}
