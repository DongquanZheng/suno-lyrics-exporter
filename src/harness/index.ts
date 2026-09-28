import { alignOriginalLyrics } from '../alignment/align';
import { exportLyrics } from '../export/format';
import { applyTiming } from '../lyrics/timing';
import type { AlignedLine } from '../types';

const fixture: AlignedLine[] = [
  { text: '月光落在旧城的窗', start: 12.43, end: 15.7, words: [] },
  { text: '远处的火车开向南方', start: 16.3, end: 20.1, words: [] },
  { text: '你说我们还会回来', start: 21.0, end: 24.2, words: [] }
];
const defaultLyrics = '[Verse]\n月光落在旧城的窗\n远处的火车开向南方\n你说我们还会再回来';
const textarea = document.querySelector<HTMLTextAreaElement>('#lyrics')!;
const result = document.querySelector<HTMLElement>('#result')!;
let lastSrt = '';
textarea.value = defaultLyrics;

function run(): void {
  const aligned = alignOriginalLyrics(textarea.value, fixture);
  const timed = applyTiming(aligned.matchedLines, { offset: -0.1 });
  lastSrt = exportLyrics(timed, 'srt');
  result.textContent = `${aligned.matches.length}/${aligned.totalOriginalLines} lines matched\nMissing: ${aligned.missing.map((line) => `${line.index + 1}. ${line.text}`).join(', ') || 'none'}\n\n${lastSrt}`;
}

document.querySelector('#run')?.addEventListener('click', run);
document.querySelector('#copy')?.addEventListener('click', () => navigator.clipboard.writeText(lastSrt));
run();

