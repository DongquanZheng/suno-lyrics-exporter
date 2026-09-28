import { cleanText } from '../utils/text';

export function getOriginalLyrics(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const value = payload as Record<string, unknown>;
  const data = value.data as Record<string, unknown> | undefined;
  const clip = (value.clip ?? data?.clip) as Record<string, unknown> | undefined;
  const candidates: unknown[] = [
    (value.metadata as Record<string, unknown> | undefined)?.prompt,
    (value.metadata as Record<string, unknown> | undefined)?.lyrics,
    (clip?.metadata as Record<string, unknown> | undefined)?.prompt,
    (clip?.metadata as Record<string, unknown> | undefined)?.lyrics,
    (data?.metadata as Record<string, unknown> | undefined)?.prompt,
    (data?.metadata as Record<string, unknown> | undefined)?.lyrics,
    value.lyrics,
    value.prompt,
    clip?.lyrics,
    clip?.prompt
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && cleanText(candidate)) return candidate.replace(/\r\n/g, '\n').trim();
  }
  return '';
}

