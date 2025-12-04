import './content/style.css';
import { mount, unmount } from 'svelte';
import TabBarApp from './content/TabBarApp.svelte';
import { loadSettings, settingsStore } from '../stores/settingsStore';
import { updateTabs, tabsStore } from '../stores/tabsStore';
import type { Message, TabUIState } from '../types';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    console.log('[EdgeTabsPlus] Content script loaded');

    // Load settings
    await loadSettings();

    // Create Shadow DOM UI
    const ui = await createShadowRootUi(ctx, {
      name: 'edgetabs-plus-ui',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      onMount: (container) => {
        // Mount Svelte 5 app
        const app = mount(TabBarApp, { target: container });
        console.log('[EdgeTabsPlus] UI mounted');
        return app;
      },
      onRemove: (app) => {
        // Unmount Svelte 5 app
        if (app) unmount(app);
      },
    });

    // Mount the UI
    ui.mount();

    // Request initial tabs
    try {
      console.log('[EdgeTabsPlus] Starting tab load sequence...');
      
      // 1. Try loading from cache first (Instant render for TC-01)
      console.log('[EdgeTabsPlus] Reading from storage.local...');
      const { cachedTabs } = await browser.storage.local.get("cachedTabs");
      console.log('[EdgeTabsPlus] Storage read complete. Result:', cachedTabs);
      
      if (cachedTabs) {
        console.log("[EdgeTabsPlus] ✅ Found cached tabs:", cachedTabs.length, 'tabs');
        console.log("[EdgeTabsPlus] Cached tab IDs:", cachedTabs.map((t: any) => t.id));
        updateTabs(cachedTabs as TabUIState[]);
      } else {
        console.log('[EdgeTabsPlus] ❌ No cached tabs found in storage');
      }

      // 2. Then fetch live data (Reconciliation)
      console.log('[EdgeTabsPlus] Sending GET_TABS to background...');
      const tabs = await browser.runtime.sendMessage({ type: "GET_TABS" }) as TabUIState[];
      console.log('[EdgeTabsPlus] Received response from background:', tabs?.length, 'tabs');
      if (tabs) {
        console.log('[EdgeTabsPlus] Live tab IDs:', tabs.map(t => t.id));
        updateTabs(tabs);
      }
    } catch (e) {
      console.error("Failed to load initial tabs:", e);
    }

    // Listen for tab updates from background
    browser.runtime.onMessage.addListener((message: Message) => {
      if (message.type === 'SYNC_TABS') {
        console.log('[EdgeTabsPlus] Received tabs update:', message.payload);
        updateTabs(message.payload);
      } else if (message.type === 'UPDATE_SETTINGS') {
        console.log('[EdgeTabsPlus] Updating settings:', message.payload);
        settingsStore.update(current => ({ ...current, ...message.payload }));
      }
    });

    console.log('[EdgeTabsPlus] Setup complete');
  },
});
