import type { Message, TabUIState } from '../types';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('[EdgeTabsPlus] Content script loaded');

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message: Message) => {
      if (message.type === 'SYNC_TABS') {
        console.log('[EdgeTabsPlus] Received tabs update:', message.payload);
        console.log(`[EdgeTabsPlus] Tab count: ${message.payload.length}`);
        
        // Log active tab details
        const activeTab = message.payload.find(tab => tab.isActive);
        if (activeTab) {
          console.log('[EdgeTabsPlus] Active tab:', {
            id: activeTab.id,
            title: activeTab.title,
            url: activeTab.url,
          });
        }
      }
    });

    console.log('[EdgeTabsPlus] Message listener registered');
  },
});
