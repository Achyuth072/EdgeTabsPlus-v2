<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { TabUIState } from "../types";

  export let tab: TabUIState;
  export let isActive: boolean = false;

  const dispatch = createEventDispatcher();

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  const LONG_PRESS_DURATION = 500; // ms

  function handleClick() {
    browser.runtime.sendMessage({
      type: "TAB_SWITCH",
      tabId: tab.id,
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }

  function handleClose(event: MouseEvent) {
    event.stopPropagation();
    browser.runtime.sendMessage({
      type: "TAB_CLOSE",
      tabId: tab.id,
    });
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    longPressTimer = setTimeout(() => {
      // Trigger context menu
      dispatch("contextmenu", {
        tabId: tab.id,
        x: touch.clientX,
        y: touch.clientY,
      });
    }, LONG_PRESS_DURATION);
  }

  function handleTouchEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function handleTouchMove() {
    // Cancel long press if finger moves
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  // Truncate long titles
  function truncateTitle(
    title: string | undefined,
    maxLength: number = 20
  ): string {
    if (!title) return "New Tab";
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  }
</script>

<div
  class="tab-item"
  class:active={isActive}
  class:loading={tab.isLoading}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
  ontouchmove={handleTouchMove}
  role="button"
  tabindex="0"
  title={tab.title || "New Tab"}
>
  <div class="tab-favicon">
    {#if tab.url}
      <img
        src={`https://icons.duckduckgo.com/ip3/${new URL(tab.url).hostname}.ico`}
        alt=""
        width="16"
        height="16"
        onerror={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.style.display = "none";
          const placeholder = img.nextElementSibling as HTMLElement;
          if (placeholder) placeholder.style.display = "block";
        }}
      />
      <div class="favicon-placeholder" style="display: none;">🌐</div>
    {:else}
      <div class="favicon-placeholder">🌐</div>
    {/if}
  </div>

  <span class="tab-title">
    {truncateTitle(tab.title)}
  </span>

  {#if tab.isPlayingAudio}
    <span class="audio-indicator" title="Playing audio">🔊</span>
  {/if}

  <button class="close-button" onclick={handleClose} title="Close tab">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
</div>

<style>
  .tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    min-width: 150px;
    max-width: 200px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
  }

  .tab-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .tab-item.active {
    background: rgba(0, 120, 212, 0.3);
    border-color: rgba(0, 120, 212, 0.5);
    color: white;
  }

  .tab-item.loading {
    opacity: 0.6;
  }

  .tab-favicon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tab-favicon img {
    width: 16px;
    height: 16px;
  }

  .favicon-placeholder {
    font-size: 14px;
  }

  .tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audio-indicator {
    flex-shrink: 0;
    font-size: 12px;
  }

  .close-button {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 10;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white !important;
  }
  /* Light theme adjustments */
  @media (prefers-color-scheme: light) {
    .tab-item {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.8);
    }

    .tab-item:hover {
      background: rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.2);
    }

    .tab-item.active {
      background: rgba(0, 120, 212, 0.2);
      border-color: rgba(0, 120, 212, 0.4);
      color: black;
    }

    .close-button {
      color: rgba(0, 0, 0, 0.6);
    }

    .close-button:hover {
      background: rgba(0, 0, 0, 0.1);
      color: black;
    }
  }
</style>
