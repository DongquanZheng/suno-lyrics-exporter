import type { ExportFormat, TimedLine } from '../types';

export function formatSrtTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const secs = Math.floor((total % 60_000) / 1000);
  const millis = total % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(',', '.');
}

function formatLrcTime(seconds: number): string {
  const totalHundredths = Math.max(0, Math.round(seconds * 100));
  const minutes = Math.floor(totalHundredths / 6000);
  const secs = Math.floor((totalHundredths % 6000) / 100);
  const hundredths = totalHundredths % 100;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

export function exportLyrics(lines: TimedLine[], format: ExportFormat): string {
  if (format === 'json') return `${JSON.stringify(lines, null, 2)}\n`;
  if (format === 'lrc') return `${lines.map((line) => `[${formatLrcTime(line.start)}]${line.text}`).join('\n')}\n`;
  if (format === 'vtt') {
    return `WEBVTT\n\n${lines.map((line) => `${formatVttTime(line.start)} --> ${formatVttTime(line.end)}\n${line.text}`).join('\n\n')}\n`;
  }
  return `${lines.map((line, index) => `${index + 1}\r\n${formatSrtTime(line.start)} --> ${formatSrtTime(line.end)}\r\n${line.text}`).join('\r\n\r\n')}\r\n`;
}

export function extensionFor(format: ExportFormat): string {
  return format === 'vtt' ? 'vtt' : format;
}

