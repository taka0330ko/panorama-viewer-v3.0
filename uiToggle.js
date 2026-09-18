(function () {
  "use strict";

  const PANEL_SELECTORS = [
    ".image-picker",
    ".color-effect-panel",
    ".photo-frame-panel",
    ".texture-effect-panel",
    ".export-panel"
  ];

  const DOCK_SELECTORS = [
    ".color-effect-panel",
    ".photo-frame-panel",
    ".texture-effect-panel",
    ".export-panel"
  ];

  function initUiToggle() {
    if (document.getElementById("effects-ui-toggle")) return;

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --controls-accent: #3b82f6;
        --controls-accent-hover: #2563eb;
        --controls-accent-soft: rgba(59, 130, 246, .16);
      }

      .effects-ui-panel {
        transition: opacity .2s ease, visibility .2s ease, transform .2s ease;
      }

      .effects-control-dock {
        position: fixed;
        z-index: 20;
        top: max(16px, env(safe-area-inset-top));
        right: max(16px, env(safe-area-inset-right));
        display: grid;
        width: min(300px, calc(100vw - 32px));
        max-height: calc(100vh - max(32px, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 24px));
        gap: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 0 2px 2px 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, .28) transparent;
      }

      .effects-control-dock .effects-ui-panel {
        position: static;
        width: 100%;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, .24);
        border-radius: 12px;
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, .14),
          rgba(8, 18, 24, .38) 42%,
          rgba(8, 18, 24, .48)
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, .12),
          0 10px 30px rgba(0, 0, 0, .16);
        backdrop-filter: blur(22px) saturate(140%);
        -webkit-backdrop-filter: blur(22px) saturate(140%);
      }

      .effects-control-dock h2 {
        font-size: 14px;
        line-height: 1.2;
      }

      .effects-control-dock select,
      .effects-control-dock input[type="text"] {
        height: 36px;
      }

      .effects-control-dock input[type="range"] {
        margin: 2px 0;
        accent-color: var(--controls-accent);
      }

      .effects-control-dock .photo-frame-switch input:checked + .photo-frame-switch-track,
      .effects-control-dock .texture-effect-switch input:checked + .texture-effect-switch-track {
        background: var(--controls-accent);
      }

      .effects-control-dock .photo-frame-switch input:focus-visible + .photo-frame-switch-track,
      .effects-control-dock .texture-effect-switch input:focus-visible + .texture-effect-switch-track {
        outline-color: var(--controls-accent);
      }

      .effects-control-dock input[type="text"]:focus,
      .effects-control-dock select:focus {
        border-color: var(--controls-accent);
        outline: 2px solid var(--controls-accent-soft);
        outline-offset: 1px;
      }

      .image-picker.effects-ui-panel {
        width: min(420px, calc(100vw - 32px));
        padding: 11px 12px;
        border-radius: 12px;
        border-color: rgba(255, 255, 255, .24);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, .14),
          rgba(8, 18, 24, .42)
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, .12),
          0 10px 30px rgba(0, 0, 0, .16);
        backdrop-filter: blur(22px) saturate(140%);
        -webkit-backdrop-filter: blur(22px) saturate(140%);
      }

      .image-picker.effects-ui-panel .drop-zone:hover,
      .image-picker.effects-ui-panel .drop-zone.is-dragging {
        border-color: var(--controls-accent);
        background: var(--controls-accent-soft);
      }

      body.effects-ui-hidden .effects-ui-panel {
        visibility: hidden;
        opacity: 0;
        transform: translateX(12px);
        pointer-events: none;
      }

      body.effects-ui-hidden .effects-control-dock {
        pointer-events: none;
      }

      .effects-ui-toggle {
        position: fixed;
        z-index: 30;
        left: max(16px, env(safe-area-inset-left));
        bottom: max(16px, env(safe-area-inset-bottom));
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 38px;
        padding: 0 13px;
        border: 1px solid rgba(255, 255, 255, .24);
        border-radius: 999px;
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, .15),
          rgba(8, 18, 24, .42)
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, .12),
          0 8px 24px rgba(0, 0, 0, .18);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        transition: background .15s ease, transform .15s ease;
      }

      .effects-ui-toggle:hover {
        border-color: var(--controls-accent);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, .2),
          rgba(18, 34, 45, .52)
        );
        transform: translateY(-1px);
      }

      .effects-ui-toggle:focus-visible {
        outline: 2px solid var(--controls-accent);
        outline-offset: 2px;
      }

      .effects-ui-toggle-icon {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      @media (max-width: 640px) {
        .effects-control-dock {
          top: auto;
          right: max(12px, env(safe-area-inset-right));
          bottom: max(64px, calc(env(safe-area-inset-bottom) + 64px));
          width: min(300px, calc(100vw - 24px));
          max-height: calc(100vh - 240px);
        }

        .image-picker.effects-ui-panel {
          top: max(12px, env(safe-area-inset-top));
          left: max(12px, env(safe-area-inset-left));
          width: calc(100vw - 24px);
        }
      }
    `;

    const button = document.createElement("button");
    button.id = "effects-ui-toggle";
    button.className = "effects-ui-toggle";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <svg class="effects-ui-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
        <circle cx="12" cy="12" r="2.5"></circle>
      </svg>
      <span>Hide controls</span>
    `;

    document.head.appendChild(style);
    document.body.appendChild(button);

    const dock = document.createElement("aside");
    dock.className = "effects-control-dock";
    dock.setAttribute("aria-label", "Panorama appearance controls");
    document.body.appendChild(dock);

    PANEL_SELECTORS.forEach(function (selector) {
      const panel = document.querySelector(selector);
      if (panel) panel.classList.add("effects-ui-panel");
    });

    DOCK_SELECTORS.forEach(function (selector) {
      const panel = document.querySelector(selector);
      if (panel) dock.appendChild(panel);
    });

    const label = button.querySelector("span");

    button.addEventListener("click", function () {
      const isHidden = document.body.classList.toggle("effects-ui-hidden");
      button.setAttribute("aria-pressed", String(isHidden));
      button.setAttribute(
        "aria-label",
        isHidden ? "Show effect controls" : "Hide effect controls"
      );
      label.textContent = isHidden ? "Show controls" : "Hide controls";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUiToggle);
  } else {
    initUiToggle();
  }
})();
