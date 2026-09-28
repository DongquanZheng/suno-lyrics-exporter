import { getCurrentSongId, observeUrlChanges } from '../suno/song';
import { ExporterPanel } from '../ui/panel';
import { loadSettings } from '../utils/settings';

void (async () => {
  const panel = new ExporterPanel(await loadSettings());
  panel.setSong(getCurrentSongId());
  observeUrlChanges((songId) => panel.setSong(songId));
  chrome.runtime.onMessage.addListener((message: unknown) => {
    if (message && typeof message === 'object' && (message as Record<string, unknown>).type === 'SLE_OPEN_PANEL') panel.open();
  });
})();

