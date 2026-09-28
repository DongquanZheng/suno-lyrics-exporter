import type { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  format: 'srt',
  offset: -0.1,
  source: 'original',
  includeSectionLabels: false,
  collapsed: true
};

export async function loadSettings(): Promise<UserSettings> {
  const saved = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(saved.settings as Partial<UserSettings> | undefined) };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

