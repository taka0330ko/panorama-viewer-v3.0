# 360° Panorama Viewer

A simple browser-based 360° panorama viewer powered by krpano.

## Run

Start a local web server in this folder:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

Do not open `index.html` directly, because browser security restrictions may prevent the viewer from loading its files.

## Use

- Drag the panorama to look around.
- Select a built-in panorama from the menu.
- Drop a local image onto the upload area, or click it to browse.

Local images must use a 2:1 equirectangular projection, such as 4096×2048. They stay in the browser and are cleared when the page is reloaded.

## Download for local use

After choosing a panorama and adjusting its appearance, click **Download Local
Viewer** in the Export / Embed panel. The downloaded ZIP contains the selected
image, the current visual settings, the krpano viewer, and a Mac launcher.

Extract the ZIP and double-click `OPEN_LOCAL.command`. If macOS blocks the first
launch, right-click the file and choose **Open**. The exported viewer runs on the
local computer and does not upload the selected panorama to Vercel.

## Add a built-in panorama

1. Add the image to the `image/` folder.
2. Add its name and path to the `builtInPanoramas` array in `index.html`.

## Export / embed on another website

Once you've dialed in a panorama, color tint, frame, and texture, open the
**Export / Embed** panel (in the controls dock, top right) and click
**Generate Embed Code**. It builds an `<iframe>` snippet that reopens the
viewer with your exact settings baked in and the editing controls hidden —
visitors can look around but not change anything.

```html
<iframe src="https://your-domain.com/panorama-viewer/index.html?pano=builtin_0&tint=8a5a32&tintop=18&frame=vignette&framecolor=f4f1e8&framewidth=20&texture=off&ui=0"
  width="800" height="450" style="border:0;max-width:100%"
  allow="fullscreen" allowfullscreen loading="lazy" title="360° Panorama"></iframe>
```

Notes:

- **Why an `<iframe>` and not a bare `<canvas>`:** krpano renders into its own
  canvas plus a tree of DOM overlays (the color/frame/texture layers) driven
  by this project's own scripts. There's no single `<canvas>` element that
  carries the whole viewer, so the standard way to drop this app into another
  site untouched — without its CSS/JS colliding with the host page's — is an
  `<iframe>` pointing at this project's `index.html`. Internally that iframe
  still uses a WebGL `<canvas>` for the actual 360° rendering.
- **Host the whole folder** (`index.html`, `pano.xml`, `krpano.js`, `image/`,
  and the `.js` files) on a web server first, then generate the embed code
  from that hosted URL so the `<iframe src>` points at your real domain
  instead of `localhost`.
- **Only built-in panoramas can be exported.** A locally dropped image is a
  temporary `blob:` URL that only exists in your browser tab, so it can't be
  linked to from an embed. Add it to `image/` and register it in
  `builtInPanoramas` first (see above), then export.
- The generated link also works on its own (open it directly) as a
  view-only, read-only version of the viewer — useful for sharing or for
  sanity-checking the embed before pasting it into your site.
- The `<iframe>`'s `width`/`height` in the snippet are a starting point; resize
  them (or wrap the iframe in a responsive container) to fit your page.

## Files

```text
panorama-viewer/
├── image/       Panorama images
├── index.html  Viewer interface, image selection, and embed-param handling
├── export.js   Generates the embed <iframe> snippet from current settings
├── colorEffect.js  Color tint overlay controls
├── frame.js        Photo frame / vignette overlay controls
├── texture.js      Texture overlay controls
├── uiToggle.js     Show/hide controls, docks the effect panels
├── pano.xml    krpano viewer settings
├── krpano.js   krpano viewer engine
└── README.md
```
# panorama-viewer-v3.0
