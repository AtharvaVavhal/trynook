# Nook Asset Inventory

## ⚠️ Legal status — read first

`nook-brand-guidelines.md` (project root) states: **"working brand name. Trademark clearance, domain availability and legal ownership are unverified. Public brand launch and domain commitment are blocked pending review of the Nook / Nooks competitive conflict."** Trademark clearance has **not** been performed (guidelines §8). Nothing in this project claims legal clearance. Public deployment needs legal review first.

## Sources (all read-only; never modified)

- `~/Downloads/nook/apps/web/public/brand/` (repo; first batch)
- `~/Downloads/nook-brand-assets.zip` (42 files, extracted to a scratch dir; only relevant files copied)
- `~/Downloads/nook-brand-guidelines.md` (byte-identical to the copy inside the zip)

## Root

| Destination | Use |
|---|---|
| `nook-brand-guidelines.md` | Official guidelines: colour, clear space, minimum sizes, background usage, misuse rules |

## Verified originals (assets root, from the repo; identical to the zip's `svg/` versions)

| Destination | Use |
|---|---|
| `assets/nook-logo-white.svg` (viewBox `0 -40 394.32 142`) | Primary logo on dark backgrounds |
| `assets/nook-favicon.svg` (32×32) | Browser tab icon (SVG) |

The zip's identical copies of these two were skipped to avoid duplicates.

## assets/svg/ (zip `svg/`, original filenames; all are closed vector paths with no font dependency)

| File | viewBox | Colour | Intended use |
|---|---|---|---|
| nook-logo-primary.svg | 0 -40 394.32 142 | #171338 | Primary logo on light backgrounds (Soft Lavender / white) |
| nook-logo-violet.svg | 0 -40 394.32 142 | #7657F6 | Violet logo on light backgrounds |
| nook-logo-black.svg | 0 -40 394.32 142 | #000000 | Single-colour/print contexts only |
| nook-logo-primary-period.svg | 0 -40 426.32 142 | #171338 + #7657F6 period | "nook." variant, light backgrounds. Check guidelines §6 before use |
| nook-logo-white-period.svg | 0 -40 426.32 142 | #FFFFFF + #7657F6 period | "nook." variant, dark backgrounds. Check guidelines §6 before use |
| nook-lockup-horizontal.svg | 0 -40 554.32 142 | #171338 | Horizontal lockup, light backgrounds |
| nook-lockup-horizontal-white.svg | 0 -40 554.32 142 | #FFFFFF | Horizontal lockup, dark backgrounds |
| nook-lockup-stacked.svg | 0 0 394.32 378 | #171338 | Stacked lockup, light backgrounds |
| nook-lockup-stacked-white.svg | 0 0 394.32 378 | #FFFFFF | Stacked lockup, dark backgrounds (good for a centred countdown hero) |
| nook-symbol.svg | 0 0 80 100 | #171338 | Standalone symbol, light backgrounds |
| nook-symbol-white.svg | 0 0 80 100 | #FFFFFF | Standalone symbol, dark backgrounds |
| nook-symbol-violet.svg | 0 0 80 100 | #7657F6 | Standalone symbol, violet accent |
| nook-symbol-black.svg | 0 0 80 100 | #000000 | Single-colour contexts only |
| nook-favicon-16.svg | 0 0 16 16 | violet/white | Small favicon |
| nook-favicon-32.svg | 0 0 32 32 | violet/white | Favicon (same design as root `nook-favicon.svg`; the two differ only in file name, so check before using both) |
| nook-favicon-mono.svg | 0 0 32 32 | #171338 | Monochrome favicon / mask-icon |
| nook-app-icon.svg | 0 0 1024 1024 | violet/white | App icon (square) |
| nook-app-icon-rounded.svg | 0 0 1024 1024 | violet/white | App icon (rounded corners) |
| nook-app-icon-indigo.svg | 0 0 1024 1024 | #171338/white | App icon, Midnight Indigo variant |
| nook-social-avatar.svg | 0 0 1024 1024 | violet/white | Social profile image |

## assets/png/ (zip `png/`, original filenames)

| File | Size | Intended use |
|---|---|---|
| nook-favicon-16.png | 16×16 | `<link rel="icon">` small |
| nook-favicon-32.png | 32×32 | `<link rel="icon">` standard |
| nook-favicon-48.png | 48×48 | Legacy/desktop shortcut icon |
| nook-favicon-180.png | 180×180 | `apple-touch-icon` |
| nook-favicon-192.png | 192×192 | Android/PWA icon |
| nook-favicon-512.png | 512×512 | PWA/large icon |
| nook-app-icon-1024.png | 1024×1024 | App icon master |
| nook-app-icon-rounded-1024.png | 1024×1024 | Rounded app icon |
| nook-social-avatar.png | 1024×1024 | Social avatar; Open Graph fallback only (not a 1200×630 share image) |
| nook-logo-transparent.png | 2400×864 | Raster dark logo, light backgrounds |
| nook-logo-white-transparent.png | 2400×864 | Raster white logo, dark backgrounds |
| nook-symbol-transparent.png | 1200×1500 | Raster symbol, light backgrounds |
| nook-symbol-white-transparent.png | 1200×1500 | Raster symbol, dark backgrounds |

## Deliberately not copied

- `nook-brand-board.png`: presentation board, not a website asset.
- Zip `README.md` and `MANIFEST.md`: packaging notes (still in the zip).
- Zip `nook-brand-guidelines.md`: identical to the root copy.
- Repo `apps/web/dist/brand/` (duplicate) and `marketing/brand/forge/` (different brand).

## Still missing

- **Brand font files:** none exist. The logo needs no font, and guidelines §8 says the marketing/product typeface is not yet selected.
- **Open Graph share image (1200×630):** none exists.
- **`.ico` favicon:** none exists (PNG/SVG favicons only).
- **Web app manifest / `apple-touch-icon` file:** can be built from the existing PNGs.

## Brand colours

Midnight Indigo #171338 · Nook Violet #7657F6 · Soft Lavender #F4F1FF · White #FFFFFF · Primary Text #26233D
