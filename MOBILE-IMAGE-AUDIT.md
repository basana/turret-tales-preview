# Mobile image loading audit — 2026-11-27

Scope: read-only inspection of `main`, plus a safe loading change on branch `perf/lazy-images-2026-11-27`. No Production or Netlify deployment.

## Verified repository facts

- `index.html` on `main`: 633,175 bytes (GitHub file metadata).
- 45 `<img>` tags in the page.
- 10 already used lazy loading before this change.
- No `srcset` attributes found.
- 37 JPEGs in `basana/turret-tales-experimental-preview`: 7,840,710 bytes (7.48 MiB).
- 27 of those JPEGs are referenced by `XMAS_PHOTOS` in the current `index.html`: 5,544,860 bytes (5.29 MiB).
- 10 JPEGs in that source repository are not referenced by the current page: 2,295,850 bytes (2.19 MiB). They should not be copied into a deployment package until their purpose is confirmed.
- Current page also references one market photo from `basana/turret-tales-christmas`.
- The Preview repository root contains 32 files, including 12 PNGs between 1.40 and 4.48 MiB. Their usage has not yet been established; do not delete them based on size alone.

## Important hosting dependency

The current page has:

```html
<base href="https://turrettales.de/">
```

This makes relative asset URLs resolve against Production. It is unsafe to remove or replace this tag until the referenced site assets have been copied into the Preview/Netlify package and every path has been checked. The current Preview is therefore not a self-contained deployment bundle.

The 27 referenced market photos are loaded from `raw.githubusercontent.com` in the experimental-preview repository. The page does not currently have responsive image variants for them.

## Change made on this branch

In `index.html`, 31 image tags that had no loading hint now use:

```html
loading="lazy" decoding="async"
```

The four eager exceptions are the splash hero, splash watermark, app emblem, and main location photo. Verification after the change: 45 image tags total; 41 lazy; 4 eager. This defers off-screen image requests but does not reduce the byte size of a photo once it is opened.

## Remaining work before a Netlify package

1. Generate small card thumbnails and medium previews from the existing JPEGs; keep originals separately for full-screen viewing.
2. Add `srcset`/appropriate `sizes` only after those derivatives exist and are mapped to the right photos.
3. Trace every relative image, CSS, script, and manifest URL currently resolved through the Production base URL.
4. Build a self-contained Preview/Netlify directory with local assets; then remove the Production base dependency only in that isolated package.
5. Measure the actual first-screen transfer and gallery transfer on a mobile connection.
6. Keep the 10 currently unreferenced JPEGs and large PNGs out of the package until their role is confirmed.

No photos were added to this repository. No files were changed on `main` or Production.
