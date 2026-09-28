import { getAlignedLyrics } from '../src/suno/alignedLyrics';
import { getSongMetadata } from '../src/suno/metadata';
import { getOriginalLyrics } from '../src/suno/originalLyrics';
import { getCurrentSongId } from '../src/suno/song';

describe('Suno response adapters', () => {
  it('reads the current song and edit URL shapes', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    expect(getCurrentSongId(`https://suno.com/song/${id}`)).toBe(id);
    expect(getCurrentSongId(`https://suno.com/edit/${id}/details`)).toBe(id);
    expect(getCurrentSongId('https://suno.com/')).toBeNull();
  });

  it('extracts original lyrics and metadata from clip metadata', () => {
    const payload = { title: 'Night / Day', image_large_url: 'https://cdn2.suno.ai/image_large_123.jpeg', metadata: { prompt: '[Verse]\nHello\n世界', duration: 123.4 } };
    expect(getOriginalLyrics(payload)).toContain('Hello');
    expect(getSongMetadata('id', payload)).toMatchObject({ title: 'Night / Day', duration: 123.4, coverUrl: 'https://cdn2.suno.ai/image_large_123.jpeg' });
  });

  it('prefers valid word timings and filters section labels', () => {
    const payload = { aligned_lyrics: [
      { text: '[Verse]', start_s: 0, end_s: 1 },
      { text: 'Hello', start_s: 1, end_s: 4, words: [{ word: 'Hello', start_s: 1.2, end_s: 2.2 }] }
    ] };
    expect(getAlignedLyrics(payload)).toEqual([{
      text: 'Hello', start: 1.2, end: 2.2, words: [{ text: 'Hello', start: 1.2, end: 2.2 }]
    }]);
  });

});
