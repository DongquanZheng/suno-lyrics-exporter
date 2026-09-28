document.getElementById('open-panel')?.addEventListener('click', () => {
  void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab?.id) return chrome.tabs.sendMessage(tab.id, { type: 'SLE_OPEN_PANEL' });
    return undefined;
  }).then(() => window.close()).catch(() => {
    const button = document.getElementById('open-panel');
    if (button) button.textContent = 'Open a Suno song first';
  });
});

