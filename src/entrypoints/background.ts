import type { TabUIState, Message } from "../types";

export default defineBackground(() => {
  console.log("EdgeTabsPlus Background Worker Started", {
    id: browser.runtime.id,
  });

  // --- Incremental State Manager ---
  let tabState: TabUIState[] = [];
  let isInitialized = false;

  // Debounce helper
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_DELAY = 100;

  /**
   * Loads initial state from storage and merges with current active tab
   */
  const init = async () => {
    if (isInitialized) return;

    try {
      // 1. Load persistent cache
      const data = await browser.storage.local.get("cachedTabs");
      const cachedTabs: TabUIState[] = data.cachedTabs || [];
      console.log("[Background] Loaded cached tabs:", cachedTabs.length);

      // 2. Get currently visible tabs (on Android, likely just the active one)
      const visibleTabs = await browser.tabs.query({});
      console.log("[Background] Visible tabs from query:", visibleTabs.length);

      // 3. Merge visible tabs into cache
      // Start with cache
      tabState = [...cachedTabs];

      // Update or add visible tabs with heuristic matching enabled
      for (const tab of visibleTabs) {
        updateTabInState(tab, true);
      }

      // 4. Mark active tab correctly
      // The query result is the source of truth for "active"
      const activeTab = visibleTabs.find((t) => t.active);
      if (activeTab && activeTab.id) {
        tabState = tabState.map((t) => ({
          ...t,
          isActive: t.id === activeTab.id,
        }));
      }

      // 5. Prune stale cached tabs (Ghost Tab Prevention)
      // Validate each cached tab ID against actual browser state
      const validatedTabState: TabUIState[] = [];
      for (const cachedTab of tabState) {
        if (!cachedTab.id) {
          validatedTabState.push(cachedTab);
          continue;
        }
        
        // Check if this tab ID exists in visible tabs
        const existsInBrowser = visibleTabs.some((vt) => vt.id === cachedTab.id);
        if (existsInBrowser) {
          validatedTabState.push(cachedTab);
        } else {
          // Double-check via API call (handles edge cases like background tabs)
          try {
            await browser.tabs.get(cachedTab.id);
            validatedTabState.push(cachedTab);
            console.log(`[Background] Kept non-visible tab: ${cachedTab.id}`);
          } catch {
            console.log(`[Background] 🗑️ Pruned ghost tab: ${cachedTab.id} (${cachedTab.title})`);
          }
        }
      }
      tabState = validatedTabState;

      isInitialized = true;
      saveAndBroadcast();
    } catch (error) {
      console.error("[Background] Init failed:", error);
    }
  };

  /**
   * Updates a single tab in the state, or adds it if missing
   * @param allowHeuristicMatch If true, attempts to match by URL+Active status (for restarts)
   */
  const updateTabInState = (chromeTab: any, allowHeuristicMatch = false) => {
    if (!chromeTab.id) return;

    const uiTab: TabUIState = {
      ...chromeTab,
      isActive: chromeTab.active,
      isLoading: chromeTab.status === "loading",
      isPlayingAudio: chromeTab.audible || false,
    };

    let index = tabState.findIndex((t) => t.id === chromeTab.id);

    // Smart Session Restore: Check for ID mismatch on restart
    if (index === -1 && allowHeuristicMatch) {
      // Look for the previously active tab with the same URL
      const candidateIndex = tabState.findIndex(t => 
        t.isActive && // Was active
        t.url === chromeTab.url // Same URL
      );
      
      if (candidateIndex > -1) {
        console.log(`[Background] Reconciled tab ID: ${tabState[candidateIndex].id} -> ${chromeTab.id}`);
        // Update the ID in the state to match the new reality
        tabState[candidateIndex].id = chromeTab.id;
        index = candidateIndex;
      }
    }

    if (index > -1) {
      // Merge new data into existing tab
      tabState[index] = { ...tabState[index], ...uiTab };
    } else {
      // Add new tab
      tabState.push(uiTab);
    }
  };

  /**
   * Removes a tab from state
   */
  const removeTabFromState = (tabId: number) => {
    tabState = tabState.filter((t) => t.id !== tabId);
  };

  /**
   * Persists state to storage and notifies content scripts
   */
  const saveAndBroadcast = async () => {
    try {
      // Save to storage
      await browser.storage.local.set({ cachedTabs: tabState });
      console.log("[Background] State saved. Total tabs:", tabState.length);

      // Broadcast to content scripts
      const message: Message = {
        type: "SYNC_TABS",
        payload: tabState,
      };

      const allTabs = await browser.tabs.query({});
      allTabs.forEach((tab) => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors for tabs without content script
          });
        }
      });
    } catch (error) {
      console.error("[Background] Broadcast failed:", error);
    }
  };

  const debouncedUpdate = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      // Refresh state from query before broadcasting
      // This ensures we catch any updates we might have missed
      const visibleTabs = await browser.tabs.query({});
      visibleTabs.forEach(tab => updateTabInState(tab, false));
      saveAndBroadcast();
    }, DEBOUNCE_DELAY);
  };

  // --- Event Listeners ---

  browser.tabs.onCreated.addListener((tab) => {
    console.log("[Background] Tab created:", tab.id);
    updateTabInState(tab);
    saveAndBroadcast();
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // console.log("[Background] Tab updated:", tabId);
    updateTabInState(tab);
    debouncedUpdate();
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    console.log("[Background] Tab removed:", tabId);
    removeTabFromState(tabId);
    saveAndBroadcast();
  });

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    console.log("[Background] Tab activated:", tabId);
    // Update active status in state
    tabState = tabState.map((t) => ({
      ...t,
      isActive: t.id === tabId,
    }));
    
    // Fetch full tab details to ensure we have latest data
    try {
      const tab = await browser.tabs.get(tabId);
      updateTabInState(tab);
    } catch (e) {
      console.error("[Background] Failed to get activated tab:", e);
    }
    
    saveAndBroadcast();
  });

  // --- Message Handling ---

  browser.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      // console.log("[Background] Received message:", message.type);

      switch (message.type) {
        case "TAB_SWITCH":
          if (message.tabId) {
            browser.tabs.update(message.tabId, { active: true }).catch((err) => {
                console.error("[Background] Switch failed, removing ghost tab:", message.tabId);
                // Ghost tab detection: if switch fails, tab is likely gone
                removeTabFromState(message.tabId);
                saveAndBroadcast();
            });
          }
          break;

        case "TAB_CLOSE":
          if (message.tabId) {
            browser.tabs.remove(message.tabId);
            // Optimistic removal
            removeTabFromState(message.tabId);
            saveAndBroadcast();
          }
          break;

        case "TAB_NEW":
          browser.tabs.create({ url: "edge://newtab" });
          break;

        case "TAB_DUPLICATE":
          if (message.tabId) {
            browser.tabs.duplicate(message.tabId);
          }
          break;

        case "TAB_CLOSE_OTHERS":
          if (message.tabId) {
            const tabsToClose = tabState
                .filter(t => t.id !== message.tabId)
                .map(t => t.id)
                .filter((id): id is number => id !== undefined);
            
            if (tabsToClose.length > 0) {
                browser.tabs.remove(tabsToClose);
                // Optimistic update
                tabState = tabState.filter(t => t.id === message.tabId);
                saveAndBroadcast();
            }
          }
          break;

        case "UPDATE_SETTINGS":
          browser.storage.local.set({ settings: message.payload });
          break;

        case "GET_TABS":
          // Ensure we are initialized
          if (!isInitialized) {
             init().then(() => sendResponse(tabState));
          } else {
             sendResponse(tabState);
          }
          return true; // Async response
      }
    }
  );

  // Start initialization
  init();
});
