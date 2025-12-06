<script lang="ts">
  import { onMount } from "svelte";
  import {
    settingsStore,
    loadSettings,
    saveSettings,
    resetSettings,
  } from "../stores/settingsStore";
  import type { UserSettings } from "../types";

  let settings: UserSettings;

  // Subscribe to the store
  const unsubscribe = settingsStore.subscribe((value) => {
    settings = value;
  });

  onMount(() => {
    // Load settings when component mounts
    loadSettings();

    return () => {
      unsubscribe();
    };
  });

  async function handleThemeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({ theme: target.value as UserSettings["theme"] });
  }

  async function handleScrollBehaviorChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({
      scrollBehavior: target.value as UserSettings["scrollBehavior"],
    });
  }

  async function handleTabWidthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({ tabWidth: target.value as UserSettings["tabWidth"] });
  }

  async function handleFixedWidthChange(event: Event) {
    const target = event.target as HTMLInputElement;
    await saveSettings({ fixedTabWidth: parseInt(target.value, 10) });
  }

  async function handleTabBarPositionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({
      tabBarPosition: target.value as UserSettings["tabBarPosition"],
    });
  }

  async function handleDisableInPwaChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({ disableInPwa: target.value === "true" });
  }

  async function handleSmartTitlesChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    await saveSettings({ smartTitles: target.value === "true" });
  }

  async function handleReset() {
    if (confirm("Reset all settings to defaults?")) {
      await resetSettings();
    }
  }
</script>

<div class="settings">
  <h2>⚙️ Settings</h2>

  <div class="setting-group">
    <label for="theme">
      <span class="label-icon">🎨</span>
      <span class="label-text">Theme</span>
    </label>
    <select id="theme" value={settings.theme} on:change={handleThemeChange}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
    <p class="setting-description">Choose your preferred color scheme</p>
  </div>

  <div class="setting-group">
    <label for="scrollBehavior">
      <span class="label-icon">📜</span>
      <span class="label-text">Scroll Behavior</span>
    </label>
    <select
      id="scrollBehavior"
      value={settings.scrollBehavior}
      on:change={handleScrollBehaviorChange}
    >
      <option value="hide-on-scroll">Hide on Scroll</option>
      <option value="always-show">Always Show</option>
    </select>
    <p class="setting-description">
      Control how the tab bar behaves when scrolling
    </p>
  </div>

  <div class="setting-group">
    <label for="tabWidth">
      <span class="label-icon">📏</span>
      <span class="label-text">Tab Width</span>
    </label>
    <select
      id="tabWidth"
      value={settings.tabWidth}
      on:change={handleTabWidthChange}
    >
      <option value="dynamic">Dynamic</option>
      <option value="adaptive">Adaptive</option>
      <option value="fixed">Fixed</option>
    </select>
    <p class="setting-description">
      Dynamic: Based on tab count • Adaptive: Based on title length • Fixed:
      Custom width
    </p>
  </div>

  {#if settings.tabWidth === "fixed"}
    <div class="setting-group slider-group">
      <label for="fixedTabWidth">
        <span class="label-icon">↔️</span>
        <span class="label-text">Fixed Width: {settings.fixedTabWidth}px</span>
      </label>
      <input
        type="range"
        id="fixedTabWidth"
        min="36"
        max="200"
        value={settings.fixedTabWidth}
        on:input={handleFixedWidthChange}
      />
      <div class="slider-labels">
        <span class="slider-label-left">Favicon Only (36px)</span>
        <span class="slider-label-right">Full Width (200px)</span>
      </div>
    </div>
  {/if}

  <div class="setting-group">
    <label for="tabBarPosition">
      <span class="label-icon">📍</span>
      <span class="label-text">Tab Bar Position</span>
    </label>
    <select
      id="tabBarPosition"
      value={settings.tabBarPosition}
      on:change={handleTabBarPositionChange}
    >
      <option value="top">Top</option>
      <option value="bottom">Bottom</option>
    </select>
    <p class="setting-description">
      Choose where the tab bar appears on the page
    </p>
  </div>

  <div class="setting-group">
    <label for="disableInPwa">
      <span class="label-icon">📱</span>
      <span class="label-text">Disable in PWA Mode</span>
    </label>
    <select
      id="disableInPwa"
      value={settings.disableInPwa ? "true" : "false"}
      on:change={handleDisableInPwaChange}
    >
      <option value="true">Enabled</option>
      <option value="false">Disabled</option>
    </select>
    <p class="setting-description">
      Automatically hide tab bar when running apps in standalone mode
    </p>
  </div>

  <div class="setting-group">
    <label for="smartTitles">
      <span class="label-icon">✨</span>
      <span class="label-text">Smart Tab Titles</span>
    </label>
    <select
      id="smartTitles"
      value={settings.smartTitles ? "true" : "false"}
      on:change={handleSmartTitlesChange}
    >
      <option value="true">Enabled</option>
      <option value="false">Disabled</option>
    </select>
    <p class="setting-description">
      Strip site names from tab titles (e.g., "Article - Site" → "Article")
    </p>
  </div>

  <div class="actions">
    <button class="reset-button" on:click={handleReset}>
      Reset to Defaults
    </button>
  </div>
</div>

<style>
  .settings {
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .setting-group {
    margin-bottom: 24px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #555;
  }

  .label-icon {
    font-size: 16px;
  }

  .label-text {
    flex: 1;
  }

  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    background-color: white;
    color: #333 !important;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }

  select:hover {
    border-color: #0078d4;
  }

  select:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
  }

  .setting-description {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: #888;
    line-height: 1.4;
  }

  .actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  .reset-button {
    width: 100%;
    padding: 10px 16px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-button:hover {
    background: #e9e9e9;
    border-color: #ccc;
    color: #333;
  }

  .reset-button:active {
    transform: scale(0.98);
  }

  /* Slider styles */
  .slider-group {
    margin-top: -8px;
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    margin: 12px 0 8px 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0078d4;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px rgba(0, 120, 212, 0.1);
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0078d4;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px rgba(0, 120, 212, 0.1);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #888;
    margin-top: 4px;
  }

  .slider-label-left,
  .slider-label-right {
    font-weight: 500;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .settings {
      color: #e0e0e0;
    }

    h2 {
      color: #fff;
    }

    label {
      color: #b0b0b0;
    }

    select {
      background-color: #2a2a2a;
      border-color: #444;
      color: #e0e0e0 !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23e0e0e0' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    }

    select option {
      background-color: #2a2a2a;
      color: #e0e0e0;
    }

    select:hover {
      border-color: #0078d4;
    }

    .setting-description {
      color: #888;
    }

    .actions {
      border-top-color: #333;
    }

    .reset-button {
      background: #2a2a2a;
      border-color: #444;
      color: #b0b0b0;
    }

    .reset-button:hover {
      background: #333;
      border-color: #555;
      color: #e0e0e0;
    }

    input[type="range"] {
      background: #444;
    }

    input[type="range"]::-webkit-slider-thumb {
      background: #0078d4;
    }

    input[type="range"]::-moz-range-thumb {
      background: #0078d4;
    }

    .slider-labels {
      color: #888;
    }
  }
</style>
