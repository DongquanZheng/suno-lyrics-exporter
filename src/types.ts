export type ExportFormat = 'srt' | 'lrc' | 'vtt' | 'json';
export type SubtitleSource = 'original' | 'sung';

export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

export interface AlignedLine {
  text: string;
  start: number | null;
  end: number | null;
  words: WordTiming[];
  section?: string;
}

export interface TimedLine {
  text: string;
  start: number;
  end: number;
}

export interface SongMetadata {
  id: string;
  title: string;
  duration: number | null;
  coverUrl: string | null;
  raw: unknown;
}

export interface AlignmentMatch {
  originalIndex: number;
  alignedIndex: number;
  score: number;
}

export interface AlignmentResult {
  matches: AlignmentMatch[];
  missing: Array<{ index: number; text: string }>;
  matchedLines: TimedLine[];
  totalOriginalLines: number;
}

export interface UserSettings {
  format: ExportFormat;
  offset: number;
  source: SubtitleSource;
  includeSectionLabels: boolean;
  collapsed: boolean;
  panelPosition?: { right: number; bottom: number };
}

export interface Diagnostics {
  songId: string;
  metadataLoaded: boolean;
  originalLineCount: number;
  alignedWordCount: number;
  matchedLineCount: number;
  totalLineCount: number;
  endpoint: string;
  version: string;
  technicalError?: string;
}

export interface SongData {
  metadata: SongMetadata;
  originalLyrics: string;
  alignedLines: AlignedLine[];
  rawAligned: unknown;
}
