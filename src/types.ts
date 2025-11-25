// Type definitions for EdgeTabsPlus

export interface TabUIState {
  id?: number;
  index: number;
  windowId?: number;
  openerTabId?: number;
  highlighted: boolean;
  active: boolean;
  pinned: boolean;
  url?: string;
  title?: string;
  favIconUrl?: string;
  status?: string;
  incognito: boolean;
  width?: number;
  height?: number;
  sessionId?: string;
  audible?: boolean;
  discarded: boolean;
  autoDiscardable: boolean;
  mutedInfo?: {
    muted: boolean;
    reason?: string;
  };
  // Is the tab currently loading?
  isLoading: boolean;
  // Is the tab currently playing audio?
  isPlayingAudio: boolean;
  // Derived from active state
  isActive: boolean;
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  scrollBehavior: 'always-show' | 'hide-on-scroll';
  tabWidth: 'dynamic' | 'fixed';
}

export interface AppState {
  tabs: TabUIState[];
  activeTabId: number | null;
  settings: UserSettings;
}

export type Message =
  | { type: 'SYNC_TABS'; payload: TabUIState[] }
  | { type: 'TAB_SWITCH'; tabId: number }
  | { type: 'TAB_CLOSE'; tabId: number }
  | { type: 'TAB_NEW' }
  | { type: 'TAB_DUPLICATE'; tabId: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> };