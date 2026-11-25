# Aetheria — The Living Gallery

A responsive 3D virtual art gallery built around the supplied `vr_gallery_house_baked.glb` model.

## Features
- Full-screen 3D gallery built from the supplied GLB architecture.
- Drag / touch orbit, wheel or pinch zoom, reset view and guided camera tour.
- Responsive artwork collection drawer with search and artwork details.
- Exhibition images are overlaid onto the model's baked picture panels where available.
- Existing exhibition content and curator workspace retained (`admin.html`).
- Loading progress, reduced-motion-friendly UI, mobile pixel-ratio tuning.
- Simple Node static server and Render Blueprint configuration.

## Run locally
Requires Node.js 18+.

```bash
npm start
```
Open `http://localhost:10000`.

## Publish with GitHub + Render
1. Create a new GitHub repository named `aetheria-gallery`.
2. Upload the contents of this folder to the repository root (including `models/vr_gallery_house_baked.glb`).
3. In Render, choose **New + → Blueprint** and connect the GitHub repository. Render reads `render.yaml` and creates the web service.
   - Or choose **New + → Web Service**, select the repository, set Runtime to Node, Build Command `npm install`, Start Command `npm start`.
4. Wait for the first deploy, then open the `.onrender.com` URL.

The GLB is about 80.5 MB. It is below GitHub's 100 MB single-file hard limit, but keep it as a normal tracked file only if GitHub accepts the upload. Do not use GitHub's browser editor for a file this large; use GitHub's web upload or Git LFS if needed. Render must deploy the `models/` directory with the app.

## Curator
Open `/admin.html` on the deployed site. Configure your curator password using the existing first-run setup in `admin-config.js`. Do not commit private credentials or API keys.

## Notes
Three.js is loaded from a public CDN. A network connection is required for the 3D engine and Google Fonts. The GLB includes baked environment geometry; decorative sky / sprite helper objects are hidden by the viewer to keep the gallery composition clean. The site is designed for desktop and mobile browsers; performance depends on the visitor's GPU and connection because the model is a large asset.
