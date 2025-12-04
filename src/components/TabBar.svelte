<script lang="ts">
  import { tabsStore } from "../stores/tabsStore";
  import { settingsStore } from "../stores/settingsStore";
  import TabItem from "./TabItem.svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import { onMount, tick } from "svelte";

  let menuVisible = false;
  let menuX = 0;
  let menuY = 0;
  let menuTabId: number | null = null;
  let tabsListElement: HTMLElement;

  let systemTheme: "light" | "dark" = "dark";
  let effectiveTheme: "light" | "dark" = "dark";

  $: effectiveTheme =
    $settingsStore.theme === "system" ? systemTheme : $settingsStore.theme;

  // Auto-scroll to active tab
  $: {
    const activeTab = $tabsStore.find((t) => t.isActive);
    if (activeTab && activeTab.id !== undefined && tabsListElement) {
      scrollToActiveTab(activeTab.id);
    }
  }

  async function scrollToActiveTab(tabId: number) {
    await tick(); // Wait for DOM update
    const tabElement = tabsListElement.querySelector(
      `[data-tab-id="${tabId}"]`
    );
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  function handleNewTab() {
    browser.runtime.sendMessage({ type: "TAB_NEW" });
  }

  function handleContextMenu(event: CustomEvent) {
    const { tabId, x, y } = event.detail;
    menuTabId = tabId;
    menuX = x;
    menuY = y;
    menuVisible = true;
  }

  function handleMenuAction(event: CustomEvent) {
    const { action } = event.detail;

    if (!menuTabId) {
      menuVisible = false;
      return;
    }

    switch (action) {
      case "duplicate":
        browser.runtime.sendMessage({
          type: "TAB_DUPLICATE",
          tabId: menuTabId,
        });
        break;
      case "close":
        browser.runtime.sendMessage({ type: "TAB_CLOSE", tabId: menuTabId });
        break;
      case "close-others":
        browser.runtime.sendMessage({
          type: "TAB_CLOSE_OTHERS",
          tabId: menuTabId,
        });
        break;
    }

    menuVisible = false;
  }

  function handleMenuClose() {
    menuVisible = false;
  }

  onMount(() => {
    // System theme detection
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme = mediaQuery.matches ? "dark" : "light";

    const themeHandler = (e: MediaQueryListEvent) => {
      systemTheme = e.matches ? "dark" : "light";
    };
    mediaQuery.addEventListener("change", themeHandler);

    const unsubscribe = tabsStore.subscribe(() => {
      menuVisible = false;
    });

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener("change", themeHandler);
    };
  });
</script>

<div class="tab-bar-container">
  <div class="tab-bar {effectiveTheme}">
    <div class="tabs-list" bind:this={tabsListElement}>
      {#each $tabsStore as tab (tab.id)}
        <TabItem
          {tab}
          isActive={tab.isActive}
          theme={effectiveTheme}
          on:contextmenu={handleContextMenu}
        />
      {/each}
    </div>

    <button class="new-tab-button" onclick={handleNewTab} title="New tab">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  </div>
</div>

{#if menuVisible && menuTabId !== null}
  <ContextMenu
    visible={menuVisible}
    tabId={menuTabId}
    x={menuX}
    y={menuY}
    on:action={handleMenuAction}
    on:close={handleMenuClose}
  />
{/if}

<style>
  .tab-bar-container {
    pointer-events: none;
  }

  .tab-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition:
      background 0.3s ease,
      border-color 0.3s ease;
  }

  .tabs-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  .tabs-list::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .tabs-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .tabs-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .new-tab-button {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(0, 120, 212, 0.3);
    border: 1px solid rgba(0, 120, 212, 0.5);
    border-radius: 6px;
    cursor: pointer;
    color: white !important;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 10;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .new-tab-button:hover {
    background: rgba(0, 120, 212, 0.5);
    border-color: rgba(0, 120, 212, 0.7);
  }

  .new-tab-button:active {
    transform: scale(0.95);
  }

  /* Light theme adjustments */
  .tab-bar.light {
    background: rgba(255, 255, 255, 0.9);
    border-bottom-color: rgba(0, 0, 0, 0.1);
  }

  .tab-bar.light .tabs-list {
    scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
  }

  .tab-bar.light .tabs-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
  }

  .tab-bar.light .tabs-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  .tab-bar.light .new-tab-button {
    background: rgba(0, 120, 212, 0.2);
    border-color: rgba(0, 120, 212, 0.4);
    color: rgb(0, 120, 212) !important;
    text-shadow: none;
  }

  .tab-bar.light .new-tab-button:hover {
    background: rgba(0, 120, 212, 0.3);
    border-color: rgba(0, 120, 212, 0.5);
  }
</style>
