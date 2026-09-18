(function () {
  "use strict";

  // Add future texture assets here.
  const TEXTURES = [
    { name: "Vintage Scratches", url: "image/effect/vintage-scratches.png" },
    { name: "Dust & Grunge", url: "image/effect/dust-grunge.png" },
    { name: "Crumpled Paper", url: "image/effect/crumpled-paper.png" },
    { name: "Distressed Surface", url: "image/effect/distressed-surface.png" },
    { name: "Vertical Film Scratches", url: "image/effect/vertical-film-scratches.png" }
  ];

  const DEFAULT_OPACITY = 32;

  function initTextureEffect() {
    if (document.getElementById("texture-effect-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      .texture-effect-overlay {
        position: fixed;
        z-index: 5;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: ${DEFAULT_OPACITY / 100};
        pointer-events: none;
        user-select: none;
        transition: opacity .2s ease;
      }

      .texture-effect-overlay.is-off { opacity: 0 !important; }

      .texture-effect-panel {
        position: fixed;
        z-index: 20;
        top: max(486px, calc(env(safe-area-inset-top) + 486px));
        right: max(16px, env(safe-area-inset-right));
        width: min(280px, calc(100vw - 32px));
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, .24);
        border-radius: 14px;
        background: rgba(7, 20, 17, .82);
        box-shadow: 0 10px 30px rgba(0, 0, 0, .22);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        backdrop-filter: blur(12px);
      }

      .texture-effect-header,
      .texture-effect-value-row {
        display: flex;
        align-items: center;
      }

      .texture-effect-header {
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 13px;
      }

      .texture-effect-title {
        margin: 0;
        font-size: 14px;
        font-weight: 650;
        letter-spacing: .01em;
      }

      .texture-effect-switch {
        position: relative;
        width: 42px;
        height: 24px;
        flex: 0 0 42px;
      }

      .texture-effect-switch input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }

      .texture-effect-switch-track {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, .2);
        cursor: pointer;
        transition: background .2s ease;
      }

      .texture-effect-switch-track::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, .3);
        transition: transform .2s ease;
      }

      .texture-effect-switch input:checked + .texture-effect-switch-track {
        background: #c99562;
      }

      .texture-effect-switch input:checked + .texture-effect-switch-track::after {
        transform: translateX(18px);
      }

      .texture-effect-switch input:focus-visible + .texture-effect-switch-track {
        outline: 2px solid #fff;
        outline-offset: 2px;
      }

      .texture-effect-field + .texture-effect-field { margin-top: 13px; }

      .texture-effect-label {
        display: block;
        margin-bottom: 7px;
        color: rgba(255, 255, 255, .7);
        font-size: 12px;
        font-weight: 600;
      }

      .texture-effect-select {
        width: 100%;
        height: 34px;
        border: 0;
        border-radius: 8px;
        padding: 0 32px 0 10px;
        background: #fff;
        color: #10201b;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }

      .texture-effect-value-row { gap: 8px; }

      .texture-effect-opacity {
        width: 100%;
        accent-color: #c99562;
        cursor: pointer;
      }

      .texture-effect-percent {
        width: 42px;
        color: rgba(255, 255, 255, .86);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }

      @media (max-width: 640px) {
        .texture-effect-panel {
          top: max(386px, calc(env(safe-area-inset-top) + 386px));
        }
      }
    `;

    const texture = document.createElement("img");
    texture.id = "texture-effect-overlay";
    texture.className = "texture-effect-overlay";
    texture.alt = "";
    texture.setAttribute("aria-hidden", "true");
    texture.draggable = false;

    const panel = document.createElement("section");
    panel.id = "texture-effect-panel";
    panel.className = "texture-effect-panel";
    panel.setAttribute("aria-label", "Photo texture settings");
    panel.innerHTML = `
      <div class="texture-effect-header">
        <h2 class="texture-effect-title">Photo Texture</h2>
        <label class="texture-effect-switch" title="Toggle photo texture">
          <input id="texture-effect-toggle" type="checkbox" checked aria-label="Show photo texture">
          <span class="texture-effect-switch-track" aria-hidden="true"></span>
        </label>
      </div>
      <div class="texture-effect-field">
        <label class="texture-effect-label" for="texture-effect-select">Texture</label>
        <select class="texture-effect-select" id="texture-effect-select"></select>
      </div>
      <div class="texture-effect-field">
        <label class="texture-effect-label" for="texture-effect-opacity">Opacity</label>
        <div class="texture-effect-value-row">
          <input class="texture-effect-opacity" id="texture-effect-opacity" type="range" min="0" max="100" value="${DEFAULT_OPACITY}">
          <output class="texture-effect-percent" id="texture-effect-percent">${DEFAULT_OPACITY}%</output>
        </div>
      </div>
    `;

    document.head.appendChild(style);
    document.body.appendChild(texture);
    document.body.appendChild(panel);

    const toggle = panel.querySelector("#texture-effect-toggle");
    const select = panel.querySelector("#texture-effect-select");
    const opacity = panel.querySelector("#texture-effect-opacity");
    const percent = panel.querySelector("#texture-effect-percent");

    TEXTURES.forEach(function (item, index) {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = item.name;
      select.appendChild(option);
    });

    if (TEXTURES.length > 0) {
      texture.src = TEXTURES[0].url;
    } else {
      toggle.checked = false;
      toggle.disabled = true;
      select.disabled = true;
      texture.classList.add("is-off");
    }

    toggle.addEventListener("change", function () {
      texture.classList.toggle("is-off", !this.checked);
    });

    select.addEventListener("change", function () {
      const selected = TEXTURES[Number(this.value)];
      if (selected) texture.src = selected.url;
    });

    opacity.addEventListener("input", function () {
      const value = Math.max(0, Math.min(100, Number(this.value)));
      texture.style.opacity = String(value / 100);
      percent.value = value + "%";
      percent.textContent = value + "%";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTextureEffect);
  } else {
    initTextureEffect();
  }
})();
