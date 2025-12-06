<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { settingsStore } from "../stores/settingsStore";
  import type { TabUIState } from "../types";

  export let tab: TabUIState;
  export let isActive: boolean = false;
  export let theme: "light" | "dark" = "dark";
  export let width: number | "auto" = 150;

  const dispatch = createEventDispatcher();

  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let touchStartX: number = 0;
  let touchStartY: number = 0;
  const LONG_PRESS_DURATION = 500; // ms
  const TOUCH_MOVE_THRESHOLD = 10; // px - allow small movements

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
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
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

  function handleTouchMove(event: TouchEvent) {
    // Only cancel long press if finger moved significantly (jitter tolerance)
    if (longPressTimer) {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > TOUCH_MOVE_THRESHOLD) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }
  }

  function handleTouchCancel() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function handleContextMenu(event: MouseEvent) {
    // Prevent native context menu on long press so our custom one shows
    event.preventDefault();
  }

  // Reactive title calculation
  $: smartTitle = $settingsStore.smartTitles
    ? getSmartTitle(tab.title)
    : tab.title || "New Tab";
  $: displayTitle =
    smartTitle.length > 20 ? smartTitle.substring(0, 20) + "..." : smartTitle;

  // Smart title: strip site suffix
  function getSmartTitle(title: string | undefined): string {
    if (!title) return "New Tab";

    // Common separators for site names
    const separators = [" - ", " | ", " – ", " — "];

    for (const sep of separators) {
      const index = title.lastIndexOf(sep);
      if (index > 0) {
        // Return the first part (page title) without the site name
        return title.substring(0, index);
      }
    }

    return title;
  }

  // Check if in favicon-only mode
  $: isFaviconOnly = typeof width === "number" && width < 80;

  // Get favicon URL - use Edge logo for edge:// URLs
  function getFaviconUrl(url: string | undefined): string {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      // Use Edge logo for edge:// protocol pages
      if (urlObj.protocol === "edge:" || urlObj.protocol === "chrome:") {
        return "https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg";
      }
      // Use DuckDuckGo icon service for other URLs
      return `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`;
    } catch {
      return "";
    }
  }
</script>

<div
  class="tab-item {theme}"
  class:active={isActive}
  class:loading={tab.isLoading}
  class:favicon-only={isFaviconOnly}
  data-tab-id={tab.id}
  onclick={handleClick}
  onkeydown={handleKeyDown}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
  ontouchmove={handleTouchMove}
  ontouchcancel={handleTouchCancel}
  oncontextmenu={handleContextMenu}
  role="button"
  tabindex="0"
  title={tab.title || "New Tab"}
  style={width === "auto"
    ? "min-width: 80px; max-width: 200px; flex: 0 1 auto;"
    : `width: ${width}px; flex-shrink: 0;`}
>
  <div class="tab-favicon">
    {#if tab.url}
      <img
        src={getFaviconUrl(tab.url)}
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

  {#if !isFaviconOnly}
    <span class="tab-title">
      {displayTitle}
    </span>

    {#if tab.isPlayingAudio}
      <span class="audio-indicator" title="Playing audio">🔊</span>
    {/if}
  {/if}

  <button
    class="close-button"
    class:favicon-only-mode={isFaviconOnly}
    onclick={handleClose}
    title="Close tab"
  >
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
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-x pan-y; /* Prevent double-tap zoom delay */
    -webkit-touch-callout: none; /* Prevent native context menu */
  }

  /* Favicon-only mode (< 80px) */
  .tab-item.favicon-only {
    padding: 6px;
    justify-content: center;
    gap: 0;
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

  /* Hide close button in favicon-only mode, show on hover */
  .tab-item.favicon-only .close-button {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    opacity: 0;
    visibility: hidden;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 50%;
  }

  .tab-item.favicon-only:hover .close-button {
    opacity: 1;
    visibility: visible;
  }

  /* Light theme adjustments */
  .tab-item.light {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.8);
  }

  .tab-item.light:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.2);
  }

  .tab-item.light.active {
    background: rgba(0, 120, 212, 0.2);
    border-color: rgba(0, 120, 212, 0.4);
    color: black;
  }

  .tab-item.light .close-button {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  .tab-item.light .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
    color: black !important;
  }
</style>
