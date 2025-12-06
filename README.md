# EdgeTabs+

**Desktop-style horizontal tab bar for Microsoft Edge on Android**

![Version](https://img.shields.io/github/package-json/v/Achyuth072/EdgeTabsPlus-v2?color=blue)
![Platform](https://img.shields.io/badge/platform-Edge%20Android-0078d4)
![Framework](https://img.shields.io/badge/framework-WXT%20%2B%20Svelte-ff3e00)

EdgeTabs+ brings the familiar desktop tab bar experience to Microsoft Edge on Android. Browse with ease using a persistent horizontal tab bar that lets you switch between tabs with a single tap, just like on desktop.

---

## Features

### Core Features
- **Instant Tab Switching** — One-tap access to all your tabs
- **Quick New Tab** — Add tabs without navigating menus
- **Easy Tab Management** — Close tabs with a single tap
- **Long-Press Context Menu** — Duplicate, close, or close other tabs
- **Auto Theme Detection** — Seamlessly adapts to system dark/light mode
- **Smart Auto-Hide** — Tab bar collapses on scroll, reappears when needed
- **60fps Performance** — Silky smooth animations with zero lag
- **Privacy First** — All processing happens locally, no data collection

### Advanced Features ✨
- **Flexible Positioning** — Choose top or bottom placement for the tab bar
- **Adaptive Tab Width** — Three sizing modes:
  - **Dynamic**: Width adjusts based on tab count
  - **Adaptive**: Tabs resize to fit content naturally
  - **Fixed**: Custom width with favicon-only mode (36-200px)
- **Smart Tab Titles** — Strips site names for cleaner display ("Article - Site" → "Article")
- **PWA Detection** — Automatically hides in standalone/PWA apps to prevent overlap
- **Window Isolation** — Keeps browser and PWA tabs separate

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Build Tool** | [WXT](https://wxt.dev) | Modern extension development framework |
| **UI Framework** | [Svelte 5](https://svelte.dev) | Reactive components with minimal overhead |
| **Language** | TypeScript | Type safety and better DX |
| **Styling** | Scoped CSS | Shadow DOM isolation |
| **State Management** | Svelte Stores | Reactive state across components |

---

## Development

### Building

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Create distribution ZIP
npm run zip

# TypeScript type checking
npm run check
```

The production build will be in `.output/chrome-mv3/`.

### Testing on Android

Testing on Edge Android requires ADB (Android Debug Bridge) and USB debugging enabled on your device.

#### Prerequisites
1.  **Enable USB Debugging**: On your Android device, go to Settings → About Phone → tap Build Number 7 times to enable Developer Options. Then go to Developer Options and enable "USB Debugging".
2.  **Install ADB**: Download and install [Android Platform Tools](https://developer.android.com/studio/releases/platform-tools) on your desktop.
3.  **Connect Device**: Connect your Android device via USB cable and authorize the debugging connection when prompted.

#### Testing Workflow
1.  **Debugging Logs**: Use `edge://inspect` on your desktop Edge browser to view console logs and inspect the extension background/content scripts.
2.  **Installation for Testing**:
    *   **Option A**: Use "Developer options" within Edge Android Canary to load the extension via `.crx`.
    *   **Option B**: Use an activity launcher app (e.g., "Activity Launcher" or "App Manager") to launch the hidden "Extension Install by Crx Activity" on Edge Android Stable. This allows you to install the `.crx` file directly.

---

## Settings

Access settings by clicking the extension icon in the toolbar:

| Setting | Options | Description |
|---------|---------|-------------|
| **Theme** | System / Light / Dark | Choose your preferred color scheme |
| **Scroll Behavior** | Hide on Scroll / Always Show | Control tab bar visibility |
| **Tab Bar Position** | Top / Bottom | Choose where the tab bar appears |
| **Tab Width** | Dynamic / Adaptive / Fixed | Tab sizing behavior |
| **Fixed Width** | 36px - 200px | Custom tab width (when Fixed mode selected) |
| **Smart Tab Titles** | Enabled / Disabled | Strip site names from tab titles |
| **Disable in PWA** | Enabled / Disabled | Auto-hide tab bar in standalone apps |

All settings update instantly and persist across browser restarts.

---

## Technical Details

### Android API Constraints

EdgeTabsPlus is designed specifically for Microsoft Edge on Android, which has several API limitations compared to desktop.

For a complete list of supported APIs, refer to the [Microsoft Edge Extension API Support](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/api-support) documentation.

| API | Status | Workaround |
|-----|--------|------------|
| `chrome.windows` | Unsupported | Assume single window context |
| `chrome.tabGroups` | Unsupported | No native grouping support |
| `chrome.contextMenus` | Unsupported | Custom HTML overlay menu |
| `chrome.tabs` | Supported | Core functionality |
| `chrome.storage` | Supported | Settings persistence |

### Performance Optimizations

1.  **Shadow DOM Isolation** — Prevents CSS conflicts with host pages
2.  **Passive Scroll Listeners** — Eliminates scroll jank
3.  **requestAnimationFrame** — Smooth 60fps animations
4.  **Debounced Tab Updates** — Reduces unnecessary re-renders
5.  **DuckDuckGo Icon Service** — Fast, cached favicon loading


## Contributing

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript strict mode)
- Use Svelte 5 syntax and best practices
- Add comments for complex logic
- Test on actual Android devices before submitting
- Update documentation for new features

---

## Acknowledgments

- Built with [WXT](https://wxt.dev)
- UI powered by [Svelte](https://svelte.dev)
- Icons from [DuckDuckGo Icon Service](https://icons.duckduckgo.com)
- Inspired by desktop browser tab interfaces

---

## Support

- **Issues**: [GitHub Issues](https://github.com/Achyuth072/EdgeTabsPlus-v2/issues)

---

<div align="center">

**Made for Edge Android users**

[⭐ Star on GitHub](https://github.com/Achyuth072/EdgeTabsPlus-v2)

</div>
