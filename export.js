(function () {
  "use strict";

  function initExportPanel() {
    if (document.getElementById("export-panel")) return;

    const style = document.createElement("style");
    style.textContent = `
      .export-panel {
        position: fixed;
        z-index: 20;
        top: max(600px, calc(env(safe-area-inset-top) + 600px));
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

      .export-header {
        margin-bottom: 13px;
      }

      .export-title {
        margin: 0;
        font-size: 14px;
        font-weight: 650;
        letter-spacing: .01em;
      }

      .export-hint {
        margin: 4px 0 0;
        color: rgba(255, 255, 255, .62);
        font-size: 11px;
        line-height: 1.4;
      }

      .export-generate,
      .export-copy {
        width: 100%;
        height: 34px;
        border: 0;
        border-radius: 8px;
        background: var(--controls-accent, #3b82f6);
        color: #fff;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .export-generate:hover,
      .export-copy:hover {
        background: var(--controls-accent-hover, #2563eb);
      }

      .export-output {
        display: none;
        margin-top: 12px;
      }

      .export-output.is-visible {
        display: block;
      }

      .export-label {
        display: block;
        margin-bottom: 7px;
        color: rgba(255, 255, 255, .7);
        font-size: 12px;
        font-weight: 600;
      }

      .export-textarea {
        width: 100%;
        height: 90px;
        resize: vertical;
        border: 1px solid rgba(255, 255, 255, .22);
        border-radius: 8px;
        padding: 8px 10px;
        outline: none;
        background: rgba(255, 255, 255, .1);
        color: #fff;
        font: 12px ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      .export-copy {
        margin-top: 8px;
      }

      .export-note {
        margin: 8px 0 0;
        color: rgba(255, 255, 255, .62);
        font-size: 11px;
        line-height: 1.45;
      }

      .export-note.is-warning {
        color: #ffd8a8;
      }

      @media (max-width: 640px) {
        .export-panel {
          top: max(500px, calc(env(safe-area-inset-top) + 500px));
        }
      }
    `;

    const panel = document.createElement("section");
    panel.id = "export-panel";
    panel.className = "export-panel";
    panel.setAttribute("aria-label", "Export panorama as embed code");
    panel.innerHTML = `
      <div class="export-header">
        <h2 class="export-title">Export / Embed</h2>
        <p class="export-hint">Bake the current panorama, color, frame, and texture into a ready-to-paste embed code.</p>
      </div>
      <button class="export-generate" type="button">Generate Embed Code</button>
      <div class="export-output" id="export-output">
        <label class="export-label" for="export-snippet">Embed snippet</label>
        <textarea class="export-textarea" id="export-snippet" readonly spellcheck="false"></textarea>
        <button class="export-copy" type="button" id="export-copy">Copy to clipboard</button>
        <p class="export-note" id="export-note"></p>
      </div>
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    const generateButton = panel.querySelector(".export-generate");
    const output = panel.querySelector("#export-output");
    const snippetField = panel.querySelector("#export-snippet");
    const copyButton = panel.querySelector("#export-copy");
    const note = panel.querySelector("#export-note");

    function readColorEffect() {
      const code = document.getElementById("color-effect-code");
      const opacity = document.getElementById("color-effect-opacity");
      if (!code || !opacity) return null;
      return { hex: code.value.replace("#", ""), opacity: opacity.value };
    }

    function readFrameEffect() {
      const toggle = document.getElementById("photo-frame-toggle");
      if (!toggle || !toggle.checked) return { style: "off" };
      const styleSelect = document.getElementById("photo-frame-style");
      const code = document.getElementById("photo-frame-code");
      const width = document.getElementById("photo-frame-width");
      return {
        style: styleSelect.value,
        hex: code.value.replace("#", ""),
        width: width.value
      };
    }

    function readTextureEffect() {
      const toggle = document.getElementById("texture-effect-toggle");
      if (!toggle || toggle.disabled || !toggle.checked) return { index: "off" };
      const select = document.getElementById("texture-effect-select");
      const opacity = document.getElementById("texture-effect-opacity");
      return { index: select.value, opacity: opacity.value };
    }

    function buildParams() {
      const panoInfo = typeof window.getExportPanoramaParam === "function"
        ? window.getExportPanoramaParam()
        : null;

      if (!panoInfo || panoInfo.type !== "builtin") {
        return { error: "custom" };
      }

      const params = new URLSearchParams();
      params.set("pano", "builtin_" + panoInfo.index);

      const color = readColorEffect();
      if (color) {
        params.set("tint", color.hex);
        params.set("tintop", color.opacity);
      }

      const frame = readFrameEffect();
      if (frame.style === "off") {
        params.set("frame", "off");
      } else {
        params.set("frame", frame.style);
        params.set("framecolor", frame.hex);
        params.set("framewidth", frame.width);
      }

      const texture = readTextureEffect();
      if (texture.index === "off") {
        params.set("texture", "off");
      } else {
        params.set("texture", texture.index);
        params.set("textureop", texture.opacity);
      }

      if (typeof window.getExportViewParams === "function") {
        const view = window.getExportViewParams();
        if (view) {
          params.set("hlookat", view.hlookat);
          params.set("vlookat", view.vlookat);
          params.set("fov", view.fov);
        }
      }

      params.set("ui", "0");
      return { params: params };
    }

    generateButton.addEventListener("click", function () {
      const result = buildParams();
      output.classList.add("is-visible");

      if (result.error === "custom") {
        snippetField.value = "";
        note.textContent =
          "The current panorama is a locally dropped image, which can't be exported because it only exists in this browser tab. Add it to the image/ folder and register it in the builtInPanoramas list in index.html, reload the page, select it again, then generate the embed code.";
        note.classList.add("is-warning");
      } else {
        const url = new URL("index.html", window.location.href);
        url.search = result.params.toString();

        const iframe =
          '<iframe src="' + url.toString() + '" ' +
          'width="800" height="450" style="border:0;max-width:100%" ' +
          'allow="fullscreen" allowfullscreen loading="lazy" ' +
          'title="360° Panorama"></iframe>';

        snippetField.value = iframe;
        note.textContent =
          "Host this whole panorama-viewer folder on a web server, then paste the snippet above into your site's HTML. The iframe opens the viewer with this panorama, color, frame, and texture already applied, and with the editing controls hidden.";
        note.classList.remove("is-warning");
      }

      // The output can render below the fold of the scrollable control
      // dock, so bring it into view instead of leaving it hidden below.
      requestAnimationFrame(function () {
        output.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });

    copyButton.addEventListener("click", function () {
      if (!snippetField.value) return;
      snippetField.select();

      const done = function () {
        copyButton.textContent = "Copied!";
        setTimeout(function () {
          copyButton.textContent = "Copy to clipboard";
        }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(snippetField.value).then(done, function () {
          document.execCommand("copy");
          done();
        });
      } else {
        document.execCommand("copy");
        done();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExportPanel);
  } else {
    initExportPanel();
  }
})();
