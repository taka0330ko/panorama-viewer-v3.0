(function () {
  "use strict";

  const DEFAULT_COLOR = "#8a5a32";
  const DEFAULT_OPACITY = 18;

  const presets = [
    { name: "Amber", color: "#8a5a32", opacity: 18 },
    { name: "Sepia", color: "#704214", opacity: 24 },
    { name: "Fade", color: "#d8c3a5", opacity: 14 },
    { name: "Olive", color: "#6b6845", opacity: 18 }
  ];

  function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
  }

  function initColorEffect() {
    if (document.getElementById("color-effect-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      .color-effect-overlay {
        position: fixed;
        z-index: 5;
        inset: 0;
        pointer-events: none;
        background: ${DEFAULT_COLOR};
        opacity: ${DEFAULT_OPACITY / 100};
        mix-blend-mode: soft-light;
        transition: background-color .15s ease;
      }

      .color-effect-panel {
        position: fixed;
        z-index: 20;
        top: max(16px, env(safe-area-inset-top));
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

      .color-effect-header,
      .color-effect-value-row,
      .color-effect-presets {
        display: flex;
        align-items: center;
      }

      .color-effect-header {
        justify-content: space-between;
        margin-bottom: 13px;
      }

      .color-effect-title {
        margin: 0;
        font-size: 14px;
        font-weight: 650;
        letter-spacing: .01em;
      }

      .color-effect-reset {
        border: 0;
        padding: 3px 0;
        background: none;
        color: rgba(255, 255, 255, .62);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .color-effect-reset:hover { color: #fff; }

      .color-effect-field + .color-effect-field { margin-top: 13px; }

      .color-effect-label {
        display: block;
        margin-bottom: 7px;
        color: rgba(255, 255, 255, .7);
        font-size: 12px;
        font-weight: 600;
      }

      .color-effect-value-row { gap: 8px; }

      .color-effect-picker {
        width: 38px;
        height: 34px;
        flex: 0 0 38px;
        padding: 2px;
        border: 1px solid rgba(255, 255, 255, .28);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }

      .color-effect-code {
        min-width: 0;
        width: 100%;
        height: 34px;
        border: 1px solid rgba(255, 255, 255, .22);
        border-radius: 8px;
        padding: 0 10px;
        outline: none;
        background: rgba(255, 255, 255, .1);
        color: #fff;
        font: 13px ui-monospace, SFMono-Regular, Menlo, monospace;
        text-transform: uppercase;
      }

      .color-effect-code:focus { border-color: rgba(255, 255, 255, .65); }
      .color-effect-code.is-invalid { border-color: #ff9d8d; }

      .color-effect-opacity {
        width: 100%;
        accent-color: #c99562;
        cursor: pointer;
      }

      .color-effect-percent {
        width: 42px;
        color: rgba(255, 255, 255, .86);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }

      .color-effect-presets {
        gap: 8px;
        margin-top: 14px;
      }

      .color-effect-preset {
        width: 25px;
        height: 25px;
        border: 2px solid rgba(255, 255, 255, .4);
        border-radius: 50%;
        cursor: pointer;
        transition: transform .15s ease, border-color .15s ease;
      }

      .color-effect-preset:hover {
        transform: scale(1.1);
        border-color: #fff;
      }

      @media (max-width: 640px) {
        .color-effect-panel {
          top: auto;
          bottom: max(16px, env(safe-area-inset-bottom));
        }
      }
    `;

    const overlay = document.createElement("div");
    overlay.id = "color-effect-overlay";
    overlay.className = "color-effect-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("section");
    panel.id = "color-effect-panel";
    panel.className = "color-effect-panel";
    panel.setAttribute("aria-label", "Panorama color effect");
    panel.innerHTML = `
      <div class="color-effect-header">
        <h2 class="color-effect-title">Vintage Tone</h2>
        <button class="color-effect-reset" type="button">Reset</button>
      </div>
      <div class="color-effect-field">
        <label class="color-effect-label" for="color-effect-code">Color</label>
        <div class="color-effect-value-row">
          <input class="color-effect-picker" id="color-effect-picker" type="color" value="${DEFAULT_COLOR}">
          <input class="color-effect-code" id="color-effect-code" type="text" value="${DEFAULT_COLOR}" maxlength="7" spellcheck="false" aria-label="Hex color code">
        </div>
      </div>
      <div class="color-effect-field">
        <label class="color-effect-label" for="color-effect-opacity">Opacity</label>
        <div class="color-effect-value-row">
          <input class="color-effect-opacity" id="color-effect-opacity" type="range" min="0" max="60" value="${DEFAULT_OPACITY}">
          <output class="color-effect-percent" id="color-effect-percent">${DEFAULT_OPACITY}%</output>
        </div>
      </div>
      <div class="color-effect-presets" aria-label="Vintage color presets"></div>
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    const picker = panel.querySelector("#color-effect-picker");
    const code = panel.querySelector("#color-effect-code");
    const opacity = panel.querySelector("#color-effect-opacity");
    const percent = panel.querySelector("#color-effect-percent");
    const presetContainer = panel.querySelector(".color-effect-presets");

    function setColor(value) {
      if (!isHexColor(value)) return;
      const normalized = value.toLowerCase();
      overlay.style.backgroundColor = normalized;
      picker.value = normalized;
      code.value = normalized.toUpperCase();
      code.classList.remove("is-invalid");
    }

    function setOpacity(value) {
      const normalized = Math.max(0, Math.min(60, Number(value)));
      overlay.style.opacity = String(normalized / 100);
      opacity.value = String(normalized);
      percent.value = normalized + "%";
      percent.textContent = normalized + "%";
    }

    picker.addEventListener("input", function () { setColor(this.value); });
    code.addEventListener("input", function () {
      let value = this.value.trim();
      if (!value.startsWith("#")) value = "#" + value;
      this.classList.toggle("is-invalid", !isHexColor(value));
      if (isHexColor(value)) setColor(value);
    });
    code.addEventListener("blur", function () {
      if (!isHexColor(this.value)) setColor(picker.value);
    });
    opacity.addEventListener("input", function () { setOpacity(this.value); });

    presets.forEach(function (preset) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "color-effect-preset";
      button.style.background = preset.color;
      button.title = preset.name;
      button.setAttribute("aria-label", preset.name + " preset");
      button.addEventListener("click", function () {
        setColor(preset.color);
        setOpacity(preset.opacity);
      });
      presetContainer.appendChild(button);
    });

    panel.querySelector(".color-effect-reset").addEventListener("click", function () {
      setColor(DEFAULT_COLOR);
      setOpacity(DEFAULT_OPACITY);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorEffect);
  } else {
    initColorEffect();
  }
})();
