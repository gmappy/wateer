# AETHERIA — Virtual Museum

Aetheria is a browser-based 3D art museum with a searchable collection, guided tour, time-of-day lighting, optional ambient sound, touch controls and a separate curator studio. It is a static website: no application server, database or build process is required.

## Project structure

- `index.html` — visitor experience and 3D gallery.
- `store.js` — exhibition schema, validation, procedural artwork and browser-draft storage.
- `exhibition.json` — published collection loaded by visitors.
- `admin.html` — curator studio for editing, previewing, importing and exporting the collection.
- `admin-config.js` — optional curator password hash configuration.
- `assets/aetheria-mark.svg` — site icon.
- `archive/legacy-manzini-gallery.html` — retained earlier gallery version.
- `netlify.toml`, `public/_redirects`, `vercel.json` — static-host configuration.

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` for the gallery and `http://localhost:8000/admin.html` for the curator studio. Use HTTPS or localhost for the password setup because Web Crypto is required.

## Visitor experience

- Select **Explore collection** to search artworks by title, artist or description. Selecting a result moves the visitor to that artwork in the 3D gallery.
- Drag the scene to look around. Use WASD or arrow keys to walk on a keyboard; use the on-screen directional pad on touch devices.
- Select the floor to walk there, select an artwork to approach it, or use the minimap to move around the building.
- Use the guided tour controls to move between numbered tour stops.
- Use the map's sky slider to preview lighting at different times. **Live** returns to local time.
- Sound is optional and starts only after a visitor gesture if enabled in their browser preference. The sound button can turn it off.

## Curator workflow

The curator studio edits a private draft in that browser. Visitors continue to see the published `exhibition.json` until a new file is exported and deployed.

1. Open `/admin.html` and create a curator password on first use.
2. Add or edit artworks, choose their type and assign an available wall or pedestal slot.
3. Set tour order to a positive number to include a work in the guided tour; use `0` to omit it.
4. Open **Preview draft** and check the exhibition in the visitor experience.
5. Choose **Publish: download exhibition.json**. Replace the site's `exhibition.json` with the downloaded file and redeploy.
6. If the export also downloads `.glb` files, put them in a `models/` directory beside `index.html` before deploying.

Drafts are stored in browser local storage under `aetheria_exhibition_v1`. Use **Export** before changing devices or clearing browser data. **Import JSON** restores a saved exhibition. Images are resized before storage. Keep locally uploaded GLB models below the curator upload limit; larger models should be hosted at a stable HTTPS URL and referenced by URL.

### Curator password and security

The first-open setup generates a salted PBKDF2 password hash. Paste the generated `window.ADMIN_PASSWORD_HASH = '…';` line into `admin-config.js` before deployment if the password must work across devices. The browser-side password gate is only a convenience barrier; it is not server authentication. Protect `/admin.html` using your hosting provider's access-control feature if the curator interface must be private. Do not put API keys or other secrets in this static project.

## 3D models

The curator supports built-in procedural forms and individual `.glb` artwork. Custom models are fitted to a display scale and placed on pedestals. If a model cannot load, a fallback sculpture is shown instead of stopping the gallery.

The separately supplied `vr_gallery_for_product_showcase_2020.glb` is a large showroom asset, not a compatible replacement for Aetheria's four-wing building. It has a different scale and layout. This rebuild does not force it into the architecture because that would require rebuilding the floor plan, walkable bounds, collision zones and artwork coordinates around it. It can be evaluated as a future alternate venue after that remapping work.

## Deploy

### Netlify

Deploy the project root. `netlify.toml` sets the publish directory to `.` and `public/_redirects` provides `/admin` as an alias for `/admin.html`.

### Vercel

Import the project as **Other** with no build command and the project root as the output directory. `vercel.json` includes clean URLs and basic response headers.

### Other static hosts

Upload the project files and folders without changing their relative paths. Ensure `store.js`, `exhibition.json`, `assets/`, and any `models/` files are deployed alongside `index.html`.

## Technical notes and limitations

- Three.js r128 and its GLTF loader are loaded from cdnjs. The 3D view requires WebGL and access to that CDN.
- If Three.js or WebGL is unavailable, Aetheria shows the exhibition as a responsive 2D collection instead.
- Mobile devices use a reduced rendering pixel ratio and do not enable real-time shadow maps; rendering pauses while the page is hidden.
- The exhibition is static JSON. There is no shared live database or multi-user publishing workflow.
- Browser visual appearance can vary with device GPU, browser, network access and screen size. Test the deployed site on the target Android phone and at least one desktop browser.

## Release 2.0 redesign

- Introduced a searchable collection drawer connected to the live 3D artwork positions.
- Reworked the visitor HUD, artwork placard, minimap, tour controls and touch interface with a unified museum-style visual system.
- Redesigned the curator studio while retaining the existing edit, import, export, preview and password setup workflows.
- Added a site icon, descriptive metadata, a cleaner project structure and this deployment guide.
- Retained the published exhibition data and existing four-wing 3D architecture.
