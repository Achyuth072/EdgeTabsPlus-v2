import './content/style.css';
import type { Message } from '../types';
import { updateTabs } from '../stores/tabsStore';
import TabBarApp from './content/TabBarApp.svelte';
import { mount, unmount } from 'svelte';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    console.log('[EdgeTabsPlus] Content script loaded');

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

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message: Message) => {
      if (message.type === 'SYNC_TABS') {
        console.log('[EdgeTabsPlus] Received tabs update:', message.payload);
        updateTabs(message.payload);
      }
    });

    console.log('[EdgeTabsPlus] Setup complete');
  },
});
