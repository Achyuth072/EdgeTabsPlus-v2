<script lang="ts">
  import { browser } from "wxt/browser";
  import Settings from "../../components/Settings.svelte";

  const manifest = browser.runtime.getManifest();
  const extensionName = manifest.name;
  const version = manifest.version;
</script>

<main>
  <div class="header">
    <div class="logo-container">
      <img src="/icon/icon128.png" alt={extensionName} class="logo" />
      <div class="title-container">
        <h1>{extensionName}</h1>
        <span class="version">v{version}</span>
      </div>
    </div>
  </div>

  <Settings />

  <div class="footer">
    <p>Desktop-style tabs for Edge Android</p>
  </div>
</main>

<style>
  main {
    box-sizing: border-box;
    background: #fff;
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

  .header {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 48px;
    height: 48px;
  }

  .title-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .version {
    font-size: 12px;
    color: #888;
    font-weight: 500;
  }

  .footer {
    padding: 12px 16px;
    text-align: center;
    border-top: 1px solid #eee;
    margin-top: 0;
  }

  .footer p {
    margin: 0;
    font-size: 12px;
    color: #888;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    main {
      background: #1e1e1e;
      color: #e0e0e0;
    }

    .header {
      border-bottom-color: #333;
    }

    h1 {
      color: #fff;
    }

    .version {
      color: #888;
    }

    .footer {
      border-top-color: #333;
    }

    .footer p {
      color: #888;
    }
  }
</style>
