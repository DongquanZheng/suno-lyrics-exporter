import { exportLyrics, formatSrtTime } from '../src/export/format';
import { applyTiming } from '../src/lyrics/timing';
import { sanitizeFileName } from '../src/utils/text';

describe('timing and export', () => {
  it('applies a negative offset and clamps at zero', () => {
    const [line] = applyTiming([{ text: 'Start', start: 0.05, end: 1 }], { offset: -0.1 });
    expect(line?.start).toBe(0);
  });

  it('prevents cue overlap', () => {
    const result = applyTiming([
      { text: 'One', start: 1, end: 4 },
      { text: 'Two', start: 3, end: 5 }
    ], { offset: 0 });
    expect(result[0]?.end).toBeLessThanOrEqual(result[1]!.start);
  });

  it('separates cues with identical source starts', () => {
    const result = applyTiming([
      { text: 'Repeat one', start: 1, end: 2 },
      { text: 'Repeat two', start: 1, end: 2 }
    ], { offset: 0 });
    expect(result[0]?.end).toBeLessThanOrEqual(result[1]!.start);
  });

  it('does not stretch across a long instrumental gap', () => {
    const [first] = applyTiming([
      { text: 'One', start: 1, end: 2 },
      { text: 'Two', start: 30, end: 32 }
    ], { offset: 0 });
    expect(first?.end).toBe(3.5);
  });

  it('formats and emits valid SRT', () => {
    expect(formatSrtTime(3723.456)).toBe('01:02:03,456');
    expect(exportLyrics([{ text: '你好', start: 1.2, end: 2.4 }], 'srt')).toContain('00:00:01,200 --> 00:00:02,400\r\n你好');
  });

  it('exports LRC, WebVTT, and JSON', () => {
    const lines = [{ text: 'Line', start: 1.2, end: 2.4 }];
    expect(exportLyrics(lines, 'lrc')).toBe('[00:01.20]Line\n');
    expect(exportLyrics(lines, 'vtt')).toContain('WEBVTT\n\n00:00:01.200 --> 00:00:02.400');
    expect(JSON.parse(exportLyrics(lines, 'json'))).toEqual(lines);
  });

  it('sanitizes Windows-reserved and illegal filename characters', () => {
    expect(sanitizeFileName('A/B: C*D? "E" <F> | G')).toBe('A_B_ C_D_ _E_ _F_ _ G');
    expect(sanitizeFileName('CON')).toBe('_CON');
  });
});
