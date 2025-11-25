import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ['tabs', 'storage', 'scripting', 'activeTab'],
    host_permissions: ['<all_urls>'],
    // Intentionally exclude contextMenus, tabGroups, windows for Android
  },
});
