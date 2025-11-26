import { writable } from 'svelte/store';
import type { TabUIState } from '../types';

/**
 * Svelte store for managing tab state
 * This is the single source of truth for the UI
 */
export const tabsStore = writable<TabUIState[]>([]);

/**
 * Store for the currently active tab ID
 */
export const activeTabIdStore = writable<number | null>(null);

/**
 * Update the tabs store with new data from the background
 */
export function updateTabs(tabs: TabUIState[]) {
  tabsStore.set(tabs);
  
  // Update active tab ID
  const activeTab = tabs.find(tab => tab.isActive);
  activeTabIdStore.set(activeTab?.id ?? null);
}

/**
 * Optimistically remove a tab from the store (before confirmation)
 */
export function optimisticallyRemoveTab(tabId: number) {
  tabsStore.update(tabs => tabs.filter(tab => tab.id !== tabId));
}