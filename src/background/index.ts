const ALLOWED_URL = /^https:\/\/studio-api\.prod\.suno\.com\/api\/(?:gen\/[0-9a-f-]{36}\/aligned_lyrics\/v2\/|clip\/[0-9a-f-]{36})$/i;

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;
  const request = message as Record<string, unknown>;
  if (request.type === 'SLE_DOWNLOAD_COVER') {
    const rawUrl = typeof request.url === 'string' ? request.url : '';
    const requestedName = typeof request.filename === 'string' ? request.filename : 'suno-cover.jpeg';
    let coverUrl: URL;
    try {
      coverUrl = new URL(rawUrl);
    } catch {
      sendResponse({ ok: false, error: 'Invalid cover URL.' });
      return;
    }
    const allowedHost = /^cdn\d*\.suno\.ai$/i.test(coverUrl.hostname);
    const allowedPath = /^\/image(?:_large)?_[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/i.test(coverUrl.pathname);
    if (!allowedHost || !allowedPath || coverUrl.protocol !== 'https:') {
      sendResponse({ ok: false, error: 'Rejected invalid cover URL.' });
      return;
    }
    const filename = requestedName
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
      .replace(/[. ]+$/g, '')
      .slice(0, 200) || 'suno-cover.jpeg';
    chrome.downloads.download({ url: coverUrl.href, filename, saveAs: false }, (downloadId) => {
      const error = chrome.runtime.lastError;
      sendResponse(error ? { ok: false, error: error.message } : { ok: true, downloadId });
    });
    return true;
  }
  if (request.type !== 'SLE_FETCH_SUNO') return;
  const url = typeof request.url === 'string' ? request.url : '';
  const token = typeof request.token === 'string' ? request.token : '';
  if (!ALLOWED_URL.test(url) || !token) {
    sendResponse({ ok: false, status: 400, error: 'Rejected invalid API request.' });
    return;
  }
  void fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'omit',
    cache: 'no-store'
  }).then(async (response) => {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    sendResponse({ ok: response.ok, status: response.status, data, error: response.ok ? undefined : response.statusText });
  }).catch((error: unknown) => {
    sendResponse({ ok: false, status: 0, error: error instanceof Error ? error.message : String(error) });
  });
  return true;
});
