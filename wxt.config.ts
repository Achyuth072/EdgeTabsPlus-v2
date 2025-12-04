import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'EdgeTabs+',
    description: 'Desktop-style horizontal tab bar for Microsoft Edge on Android',
    version: '2.0.0',
    permissions: ['tabs', 'storage', 'scripting', 'activeTab'],
    host_permissions: ['<all_urls>'],
    icons: {
      '16': 'icon/icon16.png',
      '32': 'icon/icon32.png',
      '48': 'icon/icon48.png',
      '64': 'icon/icon64.png',
      '128': 'icon/icon128.png',
    },
  },
 webExt: {
    disabled: true, // Disable auto-launch
  },
});
