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
      .export-copy,
      .export-download {
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
      .export-copy:hover,
      .export-download:hover {
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

      .export-download {
        margin-top: 10px;
        background: #10b981;
      }

      .export-download:hover {
        background: #059669;
      }

      .export-download:disabled {
        cursor: wait;
        opacity: .65;
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
      <button class="export-download" type="button" id="export-download">Download Local Viewer</button>
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
    const downloadButton = panel.querySelector("#export-download");
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

      if (!panoInfo) {
        return { error: "missing" };
      }

      const params = new URLSearchParams();
      params.set("pano", panoInfo.type === "builtin" ? "builtin_" + panoInfo.index : "builtin_0");

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
      return { params: params, panoInfo: panoInfo };
    }

    generateButton.addEventListener("click", function () {
      const result = buildParams();
      output.classList.add("is-visible");

      if (result.error || result.panoInfo.type === "custom") {
        snippetField.value = "";
        note.textContent =
          "A local image cannot be shared in an iframe. Use Download Local Viewer to save this image, the current effects, and the viewer together as a ZIP.";
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

    const textEncoder = new TextEncoder();

    function toBytes(value) {
      if (value instanceof Uint8Array) return value;
      if (value instanceof ArrayBuffer) return new Uint8Array(value);
      return textEncoder.encode(value);
    }

    function writeU16(view, offset, value) {
      view.setUint16(offset, value, true);
    }

    function writeU32(view, offset, value) {
      view.setUint32(offset, value >>> 0, true);
    }

    const crcTable = (function () {
      const table = new Uint32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
          c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
      }
      return table;
    })();

    function crc32(bytes) {
      let crc = 0xffffffff;
      for (let i = 0; i < bytes.length; i += 1) {
        crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    function zipDateTime(date) {
      const year = Math.max(1980, date.getFullYear());
      return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
        date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
      };
    }

    function createZip(files) {
      const localParts = [];
      const centralParts = [];
      const now = zipDateTime(new Date());
      let offset = 0;

      files.forEach(function (file) {
        const name = textEncoder.encode(file.name);
        const data = toBytes(file.data);
        const checksum = crc32(data);
        const local = new Uint8Array(30 + name.length);
        const localView = new DataView(local.buffer);
        writeU32(localView, 0, 0x04034b50);
        writeU16(localView, 4, 20);
        writeU16(localView, 6, 0x0800);
        writeU16(localView, 8, 0);
        writeU16(localView, 10, now.time);
        writeU16(localView, 12, now.date);
        writeU32(localView, 14, checksum);
        writeU32(localView, 18, data.length);
        writeU32(localView, 22, data.length);
        writeU16(localView, 26, name.length);
        local.set(name, 30);
        localParts.push(local, data);

        const central = new Uint8Array(46 + name.length);
        const centralView = new DataView(central.buffer);
        writeU32(centralView, 0, 0x02014b50);
        writeU16(centralView, 4, 0x031e);
        writeU16(centralView, 6, 20);
        writeU16(centralView, 8, 0x0800);
        writeU16(centralView, 10, 0);
        writeU16(centralView, 12, now.time);
        writeU16(centralView, 14, now.date);
        writeU32(centralView, 16, checksum);
        writeU32(centralView, 20, data.length);
        writeU32(centralView, 24, data.length);
        writeU16(centralView, 28, name.length);
        writeU32(centralView, 38, file.executable ? 0x81ed0000 : 0x81a40000);
        writeU32(centralView, 42, offset);
        central.set(name, 46);
        centralParts.push(central);
        offset += local.length + data.length;
      });

      const centralSize = centralParts.reduce(function (sum, part) { return sum + part.length; }, 0);
      const end = new Uint8Array(22);
      const endView = new DataView(end.buffer);
      writeU32(endView, 0, 0x06054b50);
      writeU16(endView, 8, files.length);
      writeU16(endView, 10, files.length);
      writeU32(endView, 12, centralSize);
      writeU32(endView, 16, offset);
      return new Blob(localParts.concat(centralParts, [end]), { type: "application/zip" });
    }

    function safeExtension(name) {
      const match = /\.([a-z0-9]{1,8})$/i.exec(name || "");
      return match ? "." + match[1].toLowerCase() : ".jpg";
    }

    async function fetchBytes(path) {
      const response = await fetch(new URL(path, window.location.href));
      if (!response.ok) throw new Error("Could not download " + path);
      return new Uint8Array(await response.arrayBuffer());
    }

    async function buildLocalViewer() {
      const result = buildParams();
      if (result.error) throw new Error("Choose a panorama first.");

      const appFiles = [
        "pano.xml", "krpano.js", "colorEffect.js", "frame.js", "texture.js",
        "export.js", "uiToggle.js",
        "image/effect/vintage-scratches.png", "image/effect/dust-grunge.png",
        "image/effect/crumpled-paper.png", "image/effect/distressed-surface.png",
        "image/effect/vertical-film-scratches.png"
      ];
      const files = [];
      const extension = result.panoInfo.type === "custom"
        ? safeExtension(result.panoInfo.file.name)
        : safeExtension(result.panoInfo.url);
      const imagePath = "image/panorama" + extension;

      const sourceHtml = await (await fetch(new URL("index.html", window.location.href))).text();
      const config = {
        imagePath: imagePath,
        imageName: result.panoInfo.name || "Exported panorama",
        params: result.params.toString()
      };
      const exportedHtml = sourceHtml.replace(
        "window.__LOCAL_EXPORT__ = null;",
        "window.__LOCAL_EXPORT__ = " + JSON.stringify(config).replace(/</g, "\\u003c") + ";"
      );
      files.push({ name: "index.html", data: exportedHtml });

      if (result.panoInfo.type === "custom") {
        files.push({ name: imagePath, data: new Uint8Array(await result.panoInfo.file.arrayBuffer()) });
      } else {
        files.push({ name: imagePath, data: await fetchBytes(result.panoInfo.url) });
      }

      const downloaded = await Promise.all(appFiles.map(async function (path) {
        return { name: path, data: await fetchBytes(path) };
      }));
      files.push.apply(files, downloaded);

      files.push({
        name: "OPEN_LOCAL.command",
        executable: true,
        data: "#!/bin/zsh\ncd \"$(dirname \"$0\")\"\npython3 -m http.server 8000 &\nSERVER_PID=$!\nsleep 1\nopen http://127.0.0.1:8000/index.html\nwait $SERVER_PID\n"
      });
      files.push({
        name: "README.txt",
        data: "LOCAL PANORAMA VIEWER\n\nMac: Double-click OPEN_LOCAL.command. If macOS blocks it, right-click it and choose Open.\n\nManual: Open Terminal in this folder, run: python3 -m http.server 8000\nThen visit: http://127.0.0.1:8000/index.html\n\nKeep this folder together. The panorama and its visual settings are already included.\n"
      });

      return createZip(files);
    }

    downloadButton.addEventListener("click", async function () {
      const originalText = downloadButton.textContent;
      downloadButton.disabled = true;
      downloadButton.textContent = "Building ZIP…";
      note.classList.remove("is-warning");
      note.textContent = "Collecting the panorama and offline viewer files…";
      output.classList.add("is-visible");

      try {
        const zip = await buildLocalViewer();
        const url = URL.createObjectURL(zip);
        const link = document.createElement("a");
        link.href = url;
        link.download = "panorama-local-viewer.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        note.textContent = "Downloaded panorama-local-viewer.zip. Extract it, then open OPEN_LOCAL.command on a Mac.";
      } catch (error) {
        note.classList.add("is-warning");
        note.textContent = error && error.message ? error.message : "The local viewer could not be created.";
      } finally {
        downloadButton.disabled = false;
        downloadButton.textContent = originalText;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExportPanel);
  } else {
    initExportPanel();
  }
})();
