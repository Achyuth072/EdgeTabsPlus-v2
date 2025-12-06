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
 * Store for the current window ID (to filter tabs by window)
 */
export const currentWindowIdStore = writable<number | null>(null);

/**
 * Update the tabs store with new data from the background
 * Filters tabs by current window ID if set
 */
export function updateTabs(tabs: TabUIState[]) {
  const currentWindowId = getCurrentWindowId();
  
  // Filter tabs to only show those from the current window
  const filteredTabs = currentWindowId !== null
    ? tabs.filter(tab => tab.windowId === currentWindowId)
    : tabs;
  
  tabsStore.set(filteredTabs);
  
  // Update active tab ID
  const activeTab = filteredTabs.find(tab => tab.isActive);
  activeTabIdStore.set(activeTab?.id ?? null);
}

/**
 * Set the current window ID for filtering
 */
export function setCurrentWindowId(windowId: number) {
  currentWindowIdStore.set(windowId);
}

/**
 * Get the current window ID synchronously
 */
let cachedWindowId: number | null = null;
currentWindowIdStore.subscribe(id => {
  cachedWindowId = id;
});

function getCurrentWindowId(): number | null {
  return cachedWindowId;
}

/**
 * Optimistically remove a tab from the store (before confirmation)
 */
export function optimisticallyRemoveTab(tabId: number) {
  tabsStore.update(tabs => tabs.filter(tab => tab.id !== tabId));
}