import type { TabUIState, Message } from '../types';

export default defineBackground(() => {
  console.log('EdgeTabsPlus Background Worker Started', { id: browser.runtime.id });

  // Debounce helper to prevent excessive broadcasts
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_DELAY = 100; // ms

  /**
   * Broadcasts the current tab state to all content scripts
   * Strictly queries currentWindow:true for Android compatibility
   */
  const broadcastTabs = async () => {
    try {
      // 1. Get tabs ONLY for the current window (Android constraint)
      const tabs = await browser.tabs.query({ currentWindow: true });
      
      // 2. Transform to TabUIState format
      const payload: TabUIState[] = tabs.map(tab => ({
        ...tab,
        isActive: tab.active,
        isLoading: tab.status === 'loading',
        isPlayingAudio: tab.audible || false,
      }));

      const message: Message = {
        type: 'SYNC_TABS',
        payload,
      };

      // 3. Send to all tabs to keep UI in sync
      const allTabs = await browser.tabs.query({});
      allTabs.forEach(tab => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, message).catch(() => {
            // Silently ignore errors (tab might not have content script loaded)
          });
        }
      });

      console.log(`[Background] Broadcasted ${payload.length} tabs`);
    } catch (error) {
      console.error('[Background] Error broadcasting tabs:', error);
    }
  };

  /**
   * Debounced version of broadcastTabs
   */
  const debouncedBroadcast = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(broadcastTabs, DEBOUNCE_DELAY);
  };

  // Listen to all tab events
  browser.tabs.onCreated.addListener(debouncedBroadcast);
  browser.tabs.onUpdated.addListener(debouncedBroadcast);
  browser.tabs.onRemoved.addListener(debouncedBroadcast);
  browser.tabs.onActivated.addListener(debouncedBroadcast);

  // Handle messages from content scripts
  browser.runtime.onMessage.addListener((message: Message, sender) => {
    console.log('[Background] Received message:', message.type);

    switch (message.type) {
      case 'TAB_SWITCH':
        if (message.tabId) {
          browser.tabs.update(message.tabId, { active: true });
        }
        break;

      case 'TAB_CLOSE':
        if (message.tabId) {
          browser.tabs.remove(message.tabId);
        }
        break;

      case 'TAB_NEW':
        browser.tabs.create({ url: 'edge://newtab' });
        break;

      case 'TAB_DUPLICATE':
        if (message.tabId) {
          browser.tabs.duplicate(message.tabId);
        }
        break;

      case 'TAB_CLOSE_OTHERS':
        if (message.tabId) {
          (async () => {
            try {
              // Get all tabs in current window except the target
              const allTabs = await browser.tabs.query({ currentWindow: true });
              const tabIdsToClose = allTabs
                .filter(tab => tab.id !== message.tabId)
                .map(tab => tab.id)
                .filter((id): id is number => id !== undefined);
              
              if (tabIdsToClose.length > 0) {
                await browser.tabs.remove(tabIdsToClose);
              }
            } catch (error) {
              console.error('[Background] Error closing other tabs:', error);
            }
          })();
        }
        break;

      case 'UPDATE_SETTINGS':
        // Store settings in chrome.storage.local
        browser.storage.local.set({ settings: message.payload });
        break;
    }
  });

  // Initial broadcast
  broadcastTabs();
});
