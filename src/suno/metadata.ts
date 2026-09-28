import type { SongMetadata } from '../types';
import { cleanText } from '../utils/text';

function roots(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== 'object') return [];
  const value = payload as Record<string, unknown>;
  const nested = [value, value.data, value.clip, (value.data as Record<string, unknown> | undefined)?.clip, value.metadata]
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  return nested;
}

function finite(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getSongMetadata(id: string, payload: unknown): SongMetadata {
  let title = '';
  let duration: number | null = null;
  let coverUrl: string | null = null;
  for (const root of roots(payload)) {
    for (const key of ['title', 'display_name', 'song_name', 'name']) {
      if (typeof root[key] === 'string' && cleanText(root[key])) title ||= cleanText(root[key]);
    }
    for (const key of ['duration_s', 'duration']) duration ??= finite(root[key]);
    for (const key of ['image_large_url', 'image_url']) {
      if (!coverUrl && typeof root[key] === 'string' && /^https:\/\//i.test(root[key])) coverUrl = root[key];
    }
    const metadata = root.metadata;
    if (metadata && typeof metadata === 'object') {
      const record = metadata as Record<string, unknown>;
      duration ??= finite(record.duration_s) ?? finite(record.duration);
    }
  }
  return { id, title: title || id, duration, coverUrl, raw: payload };
}
