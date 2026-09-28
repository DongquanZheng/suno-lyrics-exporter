import type { SongData } from '../types';
import { getAlignedLyrics } from './alignedLyrics';
import { getSongMetadata } from './metadata';
import { getOriginalLyrics } from './originalLyrics';

export const ALIGNED_LYRICS_ENDPOINT = 'https://studio-api.prod.suno.com/api/gen/{songId}/aligned_lyrics/v2/';
export const CLIP_ENDPOINT = 'https://studio-api.prod.suno.com/api/clip/{songId}';

interface FetchResponse {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

function request(url: string, token: string): Promise<FetchResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'SLE_FETCH_SUNO', url, token }, (response: FetchResponse) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(response);
    });
  });
}

export class SunoDataError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'SunoDataError';
  }
}

export async function loadSongData(songId: string, token: string, includeSectionLabels = false): Promise<SongData> {
  const alignedUrl = ALIGNED_LYRICS_ENDPOINT.replace('{songId}', encodeURIComponent(songId));
  const clipUrl = CLIP_ENDPOINT.replace('{songId}', encodeURIComponent(songId));
  const [aligned, clip] = await Promise.all([request(alignedUrl, token), request(clipUrl, token)]);
  if (!aligned.ok) {
    const login = aligned.status === 401 || aligned.status === 403;
    throw new SunoDataError(
      `Aligned lyrics request failed (${aligned.status}): ${aligned.error ?? 'Unknown response'}`,
      login ? 'Your Suno session could not be used. Sign in again, then retry.' : 'Could not load Suno timing data.',
      aligned.status
    );
  }
  const alignedLines = getAlignedLyrics(aligned.data, includeSectionLabels);
  if (!alignedLines.length) {
    throw new SunoDataError('The aligned lyrics response contained no usable lines.', 'No synchronized lyrics were found for this song.');
  }
  const metadataPayload = clip.ok ? clip.data : aligned.data;
  return {
    metadata: getSongMetadata(songId, metadataPayload),
    originalLyrics: getOriginalLyrics(metadataPayload),
    alignedLines,
    rawAligned: aligned.data
  };
}

