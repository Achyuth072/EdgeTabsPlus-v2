import { writable, get } from 'svelte/store';
import { browser } from 'wxt/browser';
import type { UserSettings } from '../types';

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  scrollBehavior: 'hide-on-scroll',
  tabBarPosition: 'top',
  tabWidth: 'dynamic',
  fixedTabWidth: 150,
  disableInPwa: true,
  smartTitles: true,
};

// Create the writable store
export const settingsStore = writable<UserSettings>(DEFAULT_SETTINGS);

/**
 * Load settings from chrome.storage.local
 */
export async function loadSettings(): Promise<UserSettings> {
  try {
    const result = await browser.storage.local.get('userSettings');
    const savedSettings = result.userSettings as UserSettings | undefined;
    
    if (savedSettings) {
      // Merge with defaults to ensure all fields exist
      const mergedSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
      settingsStore.set(mergedSettings);
      return mergedSettings;
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to chrome.storage.local
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    const currentSettings = get(settingsStore);
    const newSettings = { ...currentSettings, ...settings };
    
    await browser.storage.local.set({ userSettings: newSettings });
    settingsStore.set(newSettings);
    
    // Broadcast settings change to all tabs
    const tabs = await browser.tabs.query({});
    tabs.forEach((tab) => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, {
          type: 'UPDATE_SETTINGS',
          payload: newSettings,
        }).catch(() => {
          // Ignore errors for tabs that can't receive messages
        });
      }
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
}
