(function () {
  "use strict";

  const DEFAULT_COLOR = "#f4f1e8";
  const DEFAULT_WIDTH = 20;

  function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
  }

  function initPhotoFrame() {
    if (document.getElementById("photo-frame-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      .photo-frame-overlay {
        --photo-frame-color: ${DEFAULT_COLOR};
        --photo-frame-width: ${DEFAULT_WIDTH}px;
        --vignette-start: 64%;
        --vignette-step-1: 76%;
        --vignette-step-2: 88%;
        --vignette-step-3: 95%;
        position: fixed;
        z-index: 6;
        inset: 0;
        border: var(--photo-frame-width) solid ${DEFAULT_COLOR};
        box-shadow:
          inset 0 0 0 1px rgba(50, 40, 25, .12),
          inset 0 0 12px rgba(50, 40, 25, .08);
        pointer-events: none;
        transition: border-color .15s ease, opacity .2s ease;
      }

      .photo-frame-overlay.is-vignette {
        border: 0;
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent var(--vignette-start),
          rgba(244, 241, 232, .15) var(--vignette-step-1),
          rgba(244, 241, 232, .35) var(--vignette-step-2),
          rgba(244, 241, 232, .60) var(--vignette-step-3),
          rgba(244, 241, 232, .85) 100%
        );
        box-shadow: none;
      }

      .photo-frame-overlay.is-off {
        opacity: 0;
      }

      .photo-frame-panel {
        position: fixed;
        z-index: 20;
        top: max(244px, calc(env(safe-area-inset-top) + 244px));
        right: max(16px, env(safe-area-inset-right));
        width: min(280px, calc(100vw - 32px));
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, .24);
        border-radius: 14px;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        backdrop-filter: blur(12px);
      }

      .photo-frame-header,
      .photo-frame-color-row {
        display: flex;
        align-items: center;
      }

      .photo-frame-width-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .photo-frame-width {
        width: 100%;
        accent-color: #c99562;
        cursor: pointer;
      }

      .photo-frame-width-value {
        width: 42px;
        color: rgba(255, 255, 255, .86);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }

      .photo-frame-header {
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 13px;
      }

      .photo-frame-title {
        margin: 0;
        font-size: 14px;
        font-weight: 650;
        letter-spacing: .01em;
      }

      .photo-frame-switch {
        position: relative;
        width: 42px;
        height: 24px;
        flex: 0 0 42px;
      }

      .photo-frame-switch input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }

      .photo-frame-switch-track {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, .2);
        cursor: pointer;
        transition: background .2s ease;
      }

      .photo-frame-switch-track::after {
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

      .photo-frame-switch input:checked + .photo-frame-switch-track {
        background: #c99562;
      }

      .photo-frame-switch input:checked + .photo-frame-switch-track::after {
        transform: translateX(18px);
      }

      .photo-frame-switch input:focus-visible + .photo-frame-switch-track {
        outline: 2px solid #fff;
        outline-offset: 2px;
      }

      .photo-frame-label {
        display: block;
        margin-bottom: 7px;
        color: rgba(255, 255, 255, .7);
        font-size: 12px;
        font-weight: 600;
      }

      .photo-frame-field + .photo-frame-field { margin-top: 13px; }

      .photo-frame-select {
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

      .photo-frame-color-row { gap: 8px; }

      .photo-frame-picker {
        width: 38px;
        height: 34px;
        flex: 0 0 38px;
        padding: 2px;
        border: 1px solid rgba(255, 255, 255, .28);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }

      .photo-frame-code {
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

      .photo-frame-code:focus { border-color: rgba(255, 255, 255, .65); }
      .photo-frame-code.is-invalid { border-color: #ff9d8d; }

      @media (max-width: 640px) {
        .photo-frame-panel {
          top: max(150px, calc(env(safe-area-inset-top) + 150px));
        }
      }
    `;

    const frame = document.createElement("div");
    frame.id = "photo-frame-overlay";
    frame.className = "photo-frame-overlay is-vignette";
    frame.setAttribute("aria-hidden", "true");

    const panel = document.createElement("section");
    panel.id = "photo-frame-panel";
    panel.className = "photo-frame-panel";
    panel.setAttribute("aria-label", "Printed photo frame settings");
    panel.innerHTML = `
      <div class="photo-frame-header">
        <h2 class="photo-frame-title">Photo Frame</h2>
        <label class="photo-frame-switch" title="Toggle photo frame">
          <input id="photo-frame-toggle" type="checkbox" checked aria-label="Show photo frame">
          <span class="photo-frame-switch-track" aria-hidden="true"></span>
        </label>
      </div>
      <div class="photo-frame-field">
        <label class="photo-frame-label" for="photo-frame-style">Frame style</label>
        <select class="photo-frame-select" id="photo-frame-style">
          <option value="print">Printed border</option>
          <option value="vignette" selected>Vignette</option>
        </select>
      </div>
      <div class="photo-frame-field">
        <label class="photo-frame-label" for="photo-frame-code">Frame color</label>
        <div class="photo-frame-color-row">
          <input class="photo-frame-picker" id="photo-frame-picker" type="color" value="${DEFAULT_COLOR}">
          <input class="photo-frame-code" id="photo-frame-code" type="text" value="${DEFAULT_COLOR}" maxlength="7" spellcheck="false" aria-label="Frame hex color code">
        </div>
      </div>
      <div class="photo-frame-field">
        <label class="photo-frame-label" for="photo-frame-width">Edge width</label>
        <div class="photo-frame-width-row">
          <input class="photo-frame-width" id="photo-frame-width" type="range" min="4" max="80" value="${DEFAULT_WIDTH}">
          <output class="photo-frame-width-value" id="photo-frame-width-value">${DEFAULT_WIDTH}px</output>
        </div>
      </div>
    `;

    document.head.appendChild(style);
    document.body.appendChild(frame);
    document.body.appendChild(panel);

    const toggle = panel.querySelector("#photo-frame-toggle");
    const frameStyle = panel.querySelector("#photo-frame-style");
    const picker = panel.querySelector("#photo-frame-picker");
    const code = panel.querySelector("#photo-frame-code");
    const width = panel.querySelector("#photo-frame-width");
    const widthValue = panel.querySelector("#photo-frame-width-value");
    let currentColor = DEFAULT_COLOR;
    let currentWidth = DEFAULT_WIDTH;

    function updateVignette() {
      const progress = (currentWidth - 4) / 76;
      const start = 72 - (currentWidth - 4) * 0.5;
      const remaining = 100 - start;
      const step1 = start + remaining * 0.32;
      const step2 = start + remaining * 0.66;
      const step3 = start + remaining * 0.86;
      const red = parseInt(currentColor.slice(1, 3), 16);
      const green = parseInt(currentColor.slice(3, 5), 16);
      const blue = parseInt(currentColor.slice(5, 7), 16);
      const outerOpacity = 0.85 + progress * 0.15;

      frame.style.background = `radial-gradient(ellipse at center,
        transparent 0%, transparent ${start}%,
        rgba(${red}, ${green}, ${blue}, .15) ${step1}%,
        rgba(${red}, ${green}, ${blue}, .35) ${step2}%,
        rgba(${red}, ${green}, ${blue}, .60) ${step3}%,
        rgba(${red}, ${green}, ${blue}, ${outerOpacity}) 100%)`;
    }

    function setColor(value) {
      if (!isHexColor(value)) return;
      const normalized = value.toLowerCase();
      currentColor = normalized;
      frame.style.borderColor = normalized;
      frame.style.setProperty("--photo-frame-color", normalized);
      picker.value = normalized;
      code.value = normalized.toUpperCase();
      code.classList.remove("is-invalid");
      if (frame.classList.contains("is-vignette")) updateVignette();
    }

    toggle.addEventListener("change", function () {
      frame.classList.toggle("is-off", !this.checked);
    });

    frameStyle.addEventListener("change", function () {
      const isVignette = this.value === "vignette";
      frame.classList.toggle("is-vignette", isVignette);
      if (isVignette) {
        updateVignette();
      } else {
        frame.style.background = "none";
      }
    });

    width.addEventListener("input", function () {
      const value = Math.max(4, Math.min(80, Number(this.value)));
      currentWidth = value;
      const vignetteStart = 72 - (value - 4) * 0.5;
      const remaining = 100 - vignetteStart;
      const vignetteStep1 = vignetteStart + remaining * 0.32;
      const vignetteStep2 = vignetteStart + remaining * 0.66;
      const vignetteStep3 = vignetteStart + remaining * 0.86;
      frame.style.setProperty("--photo-frame-width", value + "px");
      frame.style.setProperty("--vignette-start", vignetteStart + "%");
      frame.style.setProperty("--vignette-step-1", vignetteStep1 + "%");
      frame.style.setProperty("--vignette-step-2", vignetteStep2 + "%");
      frame.style.setProperty("--vignette-step-3", vignetteStep3 + "%");
      widthValue.value = value + "px";
      widthValue.textContent = value + "px";
      if (frame.classList.contains("is-vignette")) updateVignette();
    });

    picker.addEventListener("input", function () {
      setColor(this.value);
    });

    code.addEventListener("input", function () {
      let value = this.value.trim();
      if (!value.startsWith("#")) value = "#" + value;
      this.classList.toggle("is-invalid", !isHexColor(value));
      if (isHexColor(value)) setColor(value);
    });

    code.addEventListener("blur", function () {
      if (!isHexColor(this.value)) setColor(picker.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPhotoFrame);
  } else {
    initPhotoFrame();
  }
})();
