import { alignOriginalLyrics } from '../alignment/align';
import { extensionFor, exportLyrics, formatSrtTime } from '../export/format';
import { applyTiming } from '../lyrics/timing';
import { ALIGNED_LYRICS_ENDPOINT, loadSongData } from '../suno/api';
import { countAlignedWords } from '../suno/alignedLyrics';
import { getSessionToken } from '../suno/song';
import type { AlignmentResult, Diagnostics, SongData, TimedLine, UserSettings } from '../types';
import { sanitizeFileName } from '../utils/text';
import { saveSettings } from '../utils/settings';
import { styles } from './styles';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export class ExporterPanel {
  private readonly shadow: ShadowRoot;
  private state: LoadState = 'idle';
  private songId: string | null = null;
  private data: SongData | null = null;
  private alignment: AlignmentResult | null = null;
  private timedLines: TimedLine[] = [];
  private error: { user: string; technical: string } | null = null;
  private showAll = false;
  private loadGeneration = 0;
  private notice: string | null = null;

  constructor(private settings: UserSettings) {
    const existing = document.getElementById('suno-lyrics-exporter-root');
    existing?.remove();
    const host = document.createElement('div');
    host.id = 'suno-lyrics-exporter-root';
    this.shadow = host.attachShadow({ mode: 'open' });
    document.documentElement.appendChild(host);
    this.render();
  }

  setSong(songId: string | null): void {
    if (songId === this.songId) return;
    this.loadGeneration += 1;
    this.songId = songId;
    this.data = null;
    this.alignment = null;
    this.timedLines = [];
    this.error = null;
    this.state = 'idle';
    this.showAll = false;
    this.notice = null;
    this.render();
    if (songId && !this.settings.collapsed) void this.load();
  }

  open(): void {
    if (!this.songId) return;
    this.settings.collapsed = false;
    void saveSettings(this.settings);
    this.render();
    if (this.state === 'idle') void this.load();
  }

  private async load(): Promise<void> {
    if (!this.songId || this.state === 'loading') return;
    const generation = this.loadGeneration;
    const requestedSongId = this.songId;
    const token = getSessionToken();
    if (!token) {
      this.state = 'error';
      this.error = { user: 'Sign in to Suno, then retry.', technical: 'The __session cookie was not available to the page.' };
      this.render();
      return;
    }
    this.state = 'loading';
    this.error = null;
    this.render();
    try {
      const data = await loadSongData(requestedSongId, token, this.settings.includeSectionLabels);
      if (generation !== this.loadGeneration || requestedSongId !== this.songId) return;
      this.data = data;
      this.state = 'ready';
      this.recompute();
    } catch (error) {
      if (generation !== this.loadGeneration || requestedSongId !== this.songId) return;
      this.state = 'error';
      this.error = {
        user: error instanceof Error && 'userMessage' in error ? String(error.userMessage) : 'Could not load Suno timing data.',
        technical: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
      };
    }
    this.render();
  }

  private recompute(): void {
    if (!this.data) return;
    this.alignment = this.data.originalLyrics
      ? alignOriginalLyrics(this.data.originalLyrics, this.data.alignedLines, this.settings.includeSectionLabels)
      : null;
    const originalUsable = this.alignment && this.alignment.matchedLines.length > 0;
    const base = this.settings.source === 'original' && originalUsable
      ? this.alignment!.matchedLines
      : this.data.alignedLines;
    this.timedLines = applyTiming(base, {
      offset: this.settings.offset,
      duration: this.data.metadata.duration
    });
  }

  private diagnostics(): Diagnostics {
    return {
      songId: this.songId ?? '—',
      metadataLoaded: Boolean(this.data),
      originalLineCount: this.alignment?.totalOriginalLines ?? 0,
      alignedWordCount: this.data ? countAlignedWords(this.data.alignedLines) : 0,
      matchedLineCount: this.alignment?.matches.length ?? this.data?.alignedLines.length ?? 0,
      totalLineCount: this.alignment?.totalOriginalLines ?? this.data?.alignedLines.length ?? 0,
      endpoint: this.songId ? ALIGNED_LYRICS_ENDPOINT.replace('{songId}', this.songId) : ALIGNED_LYRICS_ENDPOINT,
      version: __APP_VERSION__,
      ...(this.error ? { technicalError: this.error.technical } : {})
    };
  }

  private output(): string {
    return exportLyrics(this.timedLines, this.settings.format);
  }

  private async copy(text = this.output()): Promise<void> {
    await navigator.clipboard.writeText(text);
  }

  private download(raw = false): void {
    if (!this.data) return;
    const content = raw ? JSON.stringify({ metadata: this.data.metadata.raw, aligned: this.data.rawAligned }, null, 2) : this.output();
    const suffix = raw ? 'raw.json' : extensionFor(this.settings.format);
    const filename = `${sanitizeFileName(this.data.metadata.title, this.songId ?? 'suno-lyrics')}.${suffix}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async downloadCover(): Promise<void> {
    const url = this.data?.metadata.coverUrl;
    if (!url) return;
    const extension = new URL(url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase() ?? 'jpeg';
    const filename = `${sanitizeFileName(this.data?.metadata.title ?? '', this.songId ?? 'suno')}-cover.${extension}`;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SLE_DOWNLOAD_COVER', url, filename }) as { ok?: boolean };
      this.notice = response?.ok ? 'Cover download started.' : 'Could not download the cover image.';
    } catch {
      this.notice = 'Could not download the cover image.';
    }
    this.render();
  }

  private completenessHtml(): string {
    if (this.state === 'loading') return '<div class="status"><span class="loading"></span>Loading timing and lyrics…</div>';
    if (this.state === 'error') return `<div class="status error"><strong>${escapeHtml(this.error?.user ?? 'Could not load lyrics.')}</strong><button class="retry" data-action="retry">Retry</button></div>`;
    if (!this.data) return '<div class="status">Open the panel to load this song.</div>';
    if (!this.alignment) return '<div class="status warn"><strong>Original lyrics unavailable</strong><small>Sung Lyrics can still be exported.</small></div>';
    const matched = this.alignment.matches.length;
    const total = this.alignment.totalOriginalLines;
    const missing = this.alignment.missing;
    if (!missing.length) return `<div class="status good"><strong>✓ ${matched} / ${total} lines matched</strong><small>${countAlignedWords(this.data.alignedLines)} aligned words</small></div>`;
    return `<div class="status warn"><strong>⚠ ${matched} / ${total} lines matched</strong><small>${missing.length} lyric line${missing.length === 1 ? '' : 's'} could not be reliably aligned.</small><ol class="missing">${missing.map((item) => `<li value="${item.index + 1}">${escapeHtml(item.text)}</li>`).join('')}</ol></div>`;
  }

  private render(): void {
    if (!this.songId) {
      this.shadow.innerHTML = `<style>${styles}</style>`;
      return;
    }
    const position = this.settings.panelPosition;
    const posStyle = position ? `right:${position.right}px;bottom:${position.bottom}px` : '';
    if (this.settings.collapsed) {
      this.shadow.innerHTML = `<style>${styles}</style><div class="shell" style="${posStyle}"><button class="launcher" data-action="open" type="button"><span aria-hidden="true">♪</span> Export Lyrics</button></div>`;
      this.bind();
      return;
    }
    const preview = this.showAll ? this.timedLines : this.timedLines.slice(0, 5);
    const diag = this.diagnostics();
    this.shadow.innerHTML = `<style>${styles}</style>
      <div class="shell" style="${posStyle}"><section class="panel" role="dialog" aria-label="Suno Lyrics Exporter">
        <header class="header" data-drag-handle><h2>Suno Lyrics Exporter</h2><button class="icon" data-action="collapse" title="Collapse" aria-label="Collapse">−</button></header>
        <div class="body">
          <p class="song">Song · ${escapeHtml(this.songId)}</p>
          ${this.completenessHtml()}
          <div class="grid">
            <label>Format<select data-setting="format"><option value="srt">SRT</option><option value="lrc">LRC</option><option value="vtt">WebVTT</option><option value="json">Raw JSON</option></select></label>
            <label>Subtitle source<div class="source"><button data-source="original" class="${this.settings.source === 'original' ? 'active' : ''}">Original</button><button data-source="sung" class="${this.settings.source === 'sung' ? 'active' : ''}">Sung</button></div></label>
            <label>Timing offset<div class="offset"><button data-offset="-0.05">−</button><output>${this.settings.offset >= 0 ? '+' : ''}${this.settings.offset.toFixed(2)}s</output><button data-offset="0.05">+</button></div><button class="reset" data-action="reset-offset">Reset to −0.10s</button></label>
          </div>
          <label class="check"><input type="checkbox" data-setting="include-labels" ${this.settings.includeSectionLabels ? 'checked' : ''}/> Include section labels</label>
          <div class="preview"><div class="preview-head">Preview <button data-action="toggle-preview" ${this.timedLines.length <= 5 ? 'hidden' : ''}>${this.showAll ? 'Show less' : 'Show all'}</button></div>
            <div class="cues">${preview.length ? preview.map((line) => `<div class="cue"><time>${formatSrtTime(line.start).replace(',', '.')}</time>${escapeHtml(line.text)}</div>`).join('') : '<div class="cue">No preview available.</div>'}</div>
          </div>
          <div class="actions"><button data-action="copy" ${this.timedLines.length ? '' : 'disabled'}>Copy</button><button class="primary" data-action="download" ${this.timedLines.length ? '' : 'disabled'}>Download ${this.settings.format.toUpperCase()}</button><button class="cover" data-action="cover" ${this.data?.metadata.coverUrl ? '' : 'disabled'}>Download cover image</button></div>
          ${this.notice ? `<div class="notice">${escapeHtml(this.notice)}</div>` : ''}
          <details><summary>Diagnostics</summary><pre>${escapeHtml(JSON.stringify(diag, null, 2))}</pre><div class="diag-actions"><button data-action="copy-diagnostics">Copy diagnostics</button><button data-action="raw" ${this.data ? '' : 'disabled'}>Download raw JSON</button></div></details>
        </div>
      </section></div>`;
    const format = this.shadow.querySelector<HTMLSelectElement>('[data-setting="format"]');
    if (format) format.value = this.settings.format;
    this.bind();
  }

  private bind(): void {
    this.shadow.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', () => {
      const action = element.dataset.action;
      if (action === 'open') this.open();
      else if (action === 'collapse') { this.settings.collapsed = true; void saveSettings(this.settings); this.render(); }
      else if (action === 'retry') { this.state = 'idle'; void this.load(); }
      else if (action === 'reset-offset') this.changeOffset(-0.1, true);
      else if (action === 'toggle-preview') { this.showAll = !this.showAll; this.render(); }
      else if (action === 'copy') void this.copy();
      else if (action === 'download') this.download();
      else if (action === 'cover') void this.downloadCover();
      else if (action === 'copy-diagnostics') void this.copy(JSON.stringify(this.diagnostics(), null, 2));
      else if (action === 'raw') this.download(true);
    }));
    this.shadow.querySelector<HTMLSelectElement>('[data-setting="format"]')?.addEventListener('change', (event) => {
      this.settings.format = (event.currentTarget as HTMLSelectElement).value as UserSettings['format'];
      void saveSettings(this.settings); this.render();
    });
    this.shadow.querySelector<HTMLInputElement>('[data-setting="include-labels"]')?.addEventListener('change', (event) => {
      this.settings.includeSectionLabels = (event.currentTarget as HTMLInputElement).checked;
      this.loadGeneration += 1;
      void saveSettings(this.settings); this.state = 'idle'; void this.load();
    });
    this.shadow.querySelectorAll<HTMLButtonElement>('[data-source]').forEach((button) => button.addEventListener('click', () => {
      this.settings.source = button.dataset.source as UserSettings['source'];
      this.recompute(); void saveSettings(this.settings); this.render();
    }));
    this.shadow.querySelectorAll<HTMLButtonElement>('[data-offset]').forEach((button) => button.addEventListener('click', () => this.changeOffset(Number(button.dataset.offset))));
    this.bindDrag();
  }

  private changeOffset(value: number, absolute = false): void {
    this.settings.offset = Math.round((absolute ? value : this.settings.offset + value) * 100) / 100;
    this.settings.offset = Math.max(-5, Math.min(5, this.settings.offset));
    this.recompute(); void saveSettings(this.settings); this.render();
  }

  private bindDrag(): void {
    const handle = this.shadow.querySelector<HTMLElement>('[data-drag-handle]');
    const shell = this.shadow.querySelector<HTMLElement>('.shell');
    if (!handle || !shell) return;
    handle.addEventListener('pointerdown', (event) => {
      if ((event.target as HTMLElement).closest('button')) return;
      const rect = shell.getBoundingClientRect();
      const origin = { x: event.clientX, y: event.clientY, right: innerWidth - rect.right, bottom: innerHeight - rect.bottom };
      handle.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent) => {
        const right = Math.max(0, Math.min(innerWidth - rect.width, origin.right - (moveEvent.clientX - origin.x)));
        const bottom = Math.max(0, Math.min(innerHeight - rect.height, origin.bottom - (moveEvent.clientY - origin.y)));
        this.settings.panelPosition = { right: Math.round(right), bottom: Math.round(bottom) };
        shell.style.right = `${right}px`; shell.style.bottom = `${bottom}px`;
      };
      const up = () => { handle.removeEventListener('pointermove', move); void saveSettings(this.settings); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up, { once: true });
    });
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
