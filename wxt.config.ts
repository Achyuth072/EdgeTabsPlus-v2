import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'EdgeTabsPlus',
    description: 'Desktop-style horizontal tab bar for Microsoft Edge on Android',
    version: '2.0.0',
    permissions: ['tabs', 'storage', 'scripting', 'activeTab'],
    host_permissions: ['<all_urls>'],
    // Intentionally exclude contextMenus, tabGroups, windows for Android
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
  },
 webExt: {
    disabled: true, // Disable auto-launch, we'll manually load extension
  },
});
