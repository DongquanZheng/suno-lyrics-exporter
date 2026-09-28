import type { AlignedLine, TimedLine } from '../types';

export interface TimingOptions {
  offset: number;
  endPadding?: number;
  maxGapExtension?: number;
  minDuration?: number;
  duration?: number | null;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function applyTiming(lines: Array<TimedLine | AlignedLine>, options: TimingOptions): TimedLine[] {
  const endPadding = options.endPadding ?? 1.5;
  const maxGapExtension = options.maxGapExtension ?? 0.4;
  const minDuration = options.minDuration ?? 0.1;
  const raw = lines.flatMap((line): TimedLine[] => line.start !== null && line.end !== null
    ? [{ text: line.text, start: Math.max(0, line.start + options.offset), end: line.end }]
    : []);
  let previousStart = Number.NEGATIVE_INFINITY;
  const usable = raw.map((line) => {
    const start = Math.max(line.start, previousStart + minDuration);
    previousStart = start;
    return { ...line, start };
  });
  return usable.map((line, index) => {
    const nextStart = usable[index + 1]?.start;
    let end = line.end + endPadding;
    if (nextStart !== undefined && (end > nextStart || nextStart - end <= maxGapExtension)) end = nextStart;
    end = Math.max(line.start + minDuration, end);
    if (nextStart !== undefined) end = Math.min(end, nextStart);
    if (index === usable.length - 1 && options.duration) end = Math.min(end, options.duration);
    if (end <= line.start) end = line.start + minDuration;
    return { text: line.text, start: round(line.start), end: round(end) };
  });
}
