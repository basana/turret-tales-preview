# Turret Tales — GPS device-test preview

This repository contains an isolated preview of the GPS Follow / Free View changes.

- **Not production.** The production repository and website are not changed.
- The preview page and its service worker are hosted under `/turret-tales-preview/`.
- Images and other existing site assets are loaded from the live public site at `https://turrettales.de/` so this preview does not duplicate the original media library.
- The preview service worker uses its own cache namespace and does not clear unrelated caches on `basana.github.io`.

## Enable GitHub Pages

In this repository, open **Settings → Pages**:
1. Under **Build and deployment**, choose **Deploy from a branch**.
2. Select branch **main** and folder **/(root)**.
3. Save.

After GitHub finishes publishing, the preview address is:

https://basana.github.io/turret-tales-preview/

## Testing notes

This is a browser/device preview of the GPS Follow / Free View UI. It still requires real iPhone and Android checks for GPS permission, location updates, manual pan/zoom, Follow return, and the pharmacy / WC / full-map controls. Offline map tiles and offline route calculation are not claimed as implemented here.
