import { alignOriginalLyrics } from '../src/alignment/align';
import { lineSimilarity } from '../src/alignment/similarity';
import type { AlignedLine } from '../src/types';

function lines(texts: string[]): AlignedLine[] {
  return texts.map((text, index) => ({ text, start: index * 4, end: index * 4 + 3, words: [] }));
}

describe('multilingual monotonic alignment', () => {
  it('aligns English lyrics after a missing token', () => {
    const result = alignOriginalLyrics('We are walking through the rain', lines(['We are walking the rain']));
    expect(result.matches).toHaveLength(1);
  });

  it('ignores Chinese punctuation', () => {
    expect(lineSimilarity('月光，落在旧城的窗。', '月光落在旧城的窗')).toBeGreaterThan(0.95);
  });

  it('aligns Japanese lyrics', () => {
    const result = alignOriginalLyrics('君と歩いた道\n明日へ続いてる', lines(['君と歩いた道', '明日へ続いている']));
    expect(result.matches).toHaveLength(2);
  });

  it('aligns mixed Chinese and English', () => {
    expect(lineSimilarity('今晚 we fly together', '今晚, we fly together!')).toBe(1);
  });

  it('keeps repeated choruses mapped to distinct, monotonic timestamps', () => {
    const result = alignOriginalLyrics('Run with me\nStay tonight\nRun with me', lines(['Run with me', 'Stay tonight', 'Run with me']));
    expect(result.matches.map((match) => match.alignedIndex)).toEqual([0, 1, 2]);
  });

  it('drops section labels by default', () => {
    const result = alignOriginalLyrics('[Verse]\nFirst line\n[Chorus]\nSecond line', lines(['First line', 'Second line']));
    expect(result.totalOriginalLines).toBe(2);
    expect(result.matches).toHaveLength(2);
  });

  it('drops Markdown titles and arrangement directions from completeness counts', () => {
    const original = '# Demo Song\n[Soft piano enters]\n[Drums build a steady groove]\n[Short vocal phrases]\n[Percussion Fill]\n[Brief Flute Phrase]\nA lantern waits beside the river';
    const result = alignOriginalLyrics(original, lines(['A lantern waits beside the river']));
    expect(result.totalOriginalLines).toBe(1);
    expect(result.missing).toHaveLength(0);
  });

  it('keeps short bracketed ad-libs as lyrics', () => {
    const result = alignOriginalLyrics('(Oh yeah)\nCome home', lines(['Oh yeah', 'Come home']));
    expect(result.totalOriginalLines).toBe(2);
    expect(result.matches).toHaveLength(2);
  });

  it('reports a missing original line without losing later matches', () => {
    const result = alignOriginalLyrics('First line\nMissing forever\nLast line', lines(['First line', 'Last line']));
    expect(result.matches).toHaveLength(2);
    expect(result.missing).toEqual([{ index: 1, text: 'Missing forever' }]);
  });

  it('accepts a changed sung word when the rest of the line agrees', () => {
    const result = alignOriginalLyrics('You take me home tonight', lines(['You bring me home tonight']));
    expect(result.matches).toHaveLength(1);
  });
});
