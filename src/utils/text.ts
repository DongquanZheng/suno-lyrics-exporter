const SECTION_PATTERN = /^\s*[\[【（(]\s*(?:verse|chorus|pre[- ]?chorus|bridge|outro|intro|instrumental|interlude|hook|refrain|drop|solo|break|主歌|副歌|前奏|间奏|間奏|尾奏|导歌|導歌|Aメロ|Bメロ|サビ)[^\]】）)]*[\]】）)]\s*$/iu;
const BRACKETED_PATTERN = /^\s*[\[【（(](.*)[\]】）)]\s*$/u;
const DIRECTION_CUE = /\b(?:acoustic|electric|guitars?|drums?|bass|pipa|dizi|piano|violin|strings?|synths?|pads?|brass|percussion|beats?|hi-?hat|cello|flute|instrumental|rhythmic|groove|riffs?|arpeggio|fills?|phrases?|syllables?|vocals?|harmonies|spoken|whisper(?:ed|ing)?|enters?|adds?|answers?|builds?|swells?|fades?|transition|tempo|melody|sustained)\b/giu;

export function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function isSectionLabel(text: string): boolean {
  return SECTION_PATTERN.test(cleanText(text));
}

export function isNonLyricInstruction(text: string): boolean {
  const value = cleanText(text);
  if (/^#{1,6}\s+\S/u.test(value)) return true;
  const bracketed = value.match(BRACKETED_PATTERN)?.[1];
  if (!bracketed) return false;
  const latinWords = bracketed.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const cues = bracketed.match(DIRECTION_CUE) ?? [];
  return cues.length >= 1 && (latinWords.length >= 3 || cues.length >= 2);
}

export function splitLyricLines(lyrics: string, includeSectionLabels = false): string[] {
  return lyrics
    .split(/\r?\n/)
    .map(cleanText)
    .filter((line) => line && !isNonLyricInstruction(line) && (includeSectionLabels || !isSectionLabel(line)));
}

export function normalizeForMatch(text: string): string[] {
  const normalized = cleanText(text)
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[\p{L}\p{N}]+/gu) ?? [];
}

export function sanitizeFileName(value: string, fallback = 'suno-lyrics'): string {
  let name = cleanText(value)
    .replace(/\.(?:srt|lrc|vtt|json)$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/[. ]+$/g, '')
    .trim();
  if (!name) name = fallback;
  if (/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i.test(name)) name = `_${name}`;
  return name.slice(0, 180).replace(/[. ]+$/g, '') || fallback;
}
