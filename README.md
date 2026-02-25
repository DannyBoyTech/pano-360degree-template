# Resort Tour Template

Open-source 360° panorama tour for resorts. Built with React, Vite, and Marzipano. Uses a single config file; no Matterport or expensive tools. Designed for small 360 cameras (e.g. Insta360 X4, RICOH THETA X).

## Quick start

1. Install: `npm install`
2. Add panorama images to `public/panos/` with naming: `entrance_01.jpg`, `lobby_01.jpg`, `pool_01.jpg`, `river_deck_01.jpg`, `mountain_view_01.jpg`. Use the download script to fetch sample images.
3. Run: `npm run dev`

## Testing

- **Dev:** `npm run dev` then open http://localhost:5173. Use "Explore Freely" or "Start Guided Tour", then "Book Now".
- **Build:** `npm run build` then `npm run preview`.
- **Lint:** `npm run lint`

## Sample 360 images

From the project root:

```powershell
.\scripts\download-sample-panos.ps1
```

This downloads five **different** equirectangular panoramas from Wikimedia Commons (CC-licensed): entrance hall, church interior (lobby), lake (pool), river waterfront, mountain viewpoint. See `public/panos/CREDITS.txt` for attribution. For production, use your own 360 camera assets.

## Project structure

- `src/App.jsx` – root UI (header, toolbar, viewer, bottom scene title)
- `src/components/` – Header, CTAButton, GuidedTourControls, LoadingOverlay
- `src/viewers/` – MarzipanoViewer, ViewerShell
- `src/hotspots/` – hotspotFactory, NavHotspot, InfoHotspot (for wiring click-to-go)
- `src/data/resort.config.json` – brand, startSceneId, scenes, guidedTour
- `src/hooks/` – useViewerState, useGuidedTour
- `src/utils/` – configValidation

## Config

Edit `src/data/resort.config.json`: `brand`, `startSceneId`, `scenes` (id, title, image path, hotspots), and `guidedTour` (ordered scene IDs). Reuse the template for other resorts by changing only this file.

## Click-to-go (free-walk style)

In each scene, link hotspots appear in the 360 view (e.g. "Go to Lobby", "Go to Pool"). When you click one:

1. **Turn toward the sign** – The view smoothly rotates toward that hotspot (you can interrupt by dragging to look around).
2. **Move to the next place** – The scene fades to the next panorama over about 1 second.
3. **Look around anytime** – During the turn and during the fade you can drag to look around; the transition continues in the background.

Scenes are cached so returning to a previous room is instant. Hotspot positions use optional `yaw` and `pitch` in radians in config; if omitted, they are spread around the horizon.
3. Guided auto-go: autorotate 4–8s then advance; pause/resume.
4. Deploy to GitHub Pages, Netlify, or Vercel.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run preview` – preview production build
