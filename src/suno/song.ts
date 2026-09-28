const SONG_PATH = /\/(?:song|edit)\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/|$)/i;

export function getCurrentSongId(url = location.href): string | null {
  try {
    return new URL(url).pathname.match(SONG_PATH)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function getSessionToken(cookie = document.cookie): string | null {
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('__session='));
  return entry ? decodeURIComponent(entry.slice('__session='.length)) : null;
}

export function observeUrlChanges(callback: (songId: string | null) => void): () => void {
  let previous = location.href;
  let queued = false;
  const check = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (location.href === previous) return;
      previous = location.href;
      callback(getCurrentSongId(previous));
    });
  };
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', check);
  const interval = window.setInterval(check, 750);
  return () => {
    observer.disconnect();
    window.removeEventListener('popstate', check);
    clearInterval(interval);
  };
}

