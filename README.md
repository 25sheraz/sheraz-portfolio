# Sheraz Ahmad · Interactive 3D Portfolio

A single-page portfolio with a WebGL "agent graph" that reshapes itself as you scroll.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The dev server is also exposed on your LAN, so you can open the "Network" URL on your phone to test on a real device.

## Build for production

```bash
npm run build
npm run preview   # serves the built site locally
```

The static output lands in `dist/`. Deploy that folder to Vercel, Netlify or GitHub Pages.

## Edit the content

Everything the site says lives in `src/data/cv.js`: name, intro, stats, experience, projects, skills, education and contact links. Change it there and the page updates.

To replace the CV download, overwrite `public/Sheraz_Ahmad_CV.pdf`.

## Where things are

| Path | What it does |
| --- | --- |
| `index.html` | Page skeleton and section shells |
| `src/styles/main.css` | All styling, mobile-first, dark and light themes |
| `src/scene/graph.js` | The node/edge particle system, pulses and highlights |
| `src/scene/layouts.js` | The shape the graph takes for each section |
| `src/scene/poses.js` | Camera and graph placement per section, with mobile overrides |
| `src/scene/scene.js` | Renderer, bloom, pointer ripple, resize handling |
| `src/scene/scroll.js` | Binds scroll position to the active scene |
| `src/sections/render.js` | Turns `cv.js` into HTML |
| `src/ui/*` | Nav, loader, cursor, theme toggle, reveal and counter effects |
