# nook — launch countdown

A standalone, dependency-free countdown page: HTML, CSS and vanilla JavaScript. No build step, backend, analytics or data collection.

## ⚠️ Legal status

The brand guidelines (`nook-brand-guidelines.md`) state that **nook is a working brand name. Trademark clearance, domain availability and legal ownership are unverified, and public brand launch and domain commitment are blocked pending review of the Nook / Nooks competitive conflict.** This project does not claim legal clearance, and `trynook.in` is shown as text only (not linked). **Do not publish or point a domain at this page until legal review is complete.**

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Semantic markup, SEO and Open Graph metadata |
| `styles.css` | Layout, type, motion (honours `prefers-reduced-motion`) |
| `script.js` | Countdown logic |
| `assets/` | Official brand assets (see `ASSET_INVENTORY.md`) |
| `nook-brand-guidelines.md` | Official guidelines |

Assets used: `assets/svg/nook-lockup-stacked-white.svg` (stacked white lockup, per guidelines §5 for dark backgrounds), `assets/nook-favicon.svg` and `assets/png/nook-favicon-{16,32,180}.png`.

## Countdown

- Target: **4 November 2026, 12:00 PM IST**, encoded as `2026-11-04T12:00:00+05:30`. This is one absolute instant, so the result does not depend on the visitor's timezone.
- Ticks aligned to second boundaries; pauses when the tab is hidden and resyncs on return.
- At or after the target the timer is replaced by a launch-day message.
- Screen readers get a once-per-minute update instead of per-second chatter.

### Previewing other times

Add `?now=<ISO timestamp with offset>` to override the page's clock (affects only your own view):

- Before: `index.html?now=2026-11-01T09:00:00%2B05:30`
- Final seconds: `index.html?now=2026-11-04T11:59:55%2B05:30`
- After: `index.html?now=2026-11-05T09:00:00%2B05:30`

(`+` must be written `%2B` in a URL.)

## Design decisions

- **Logo:** stacked white lockup on Midnight Indigo. The marketing-only "nook." period variants were not used (guidelines §6).
- **Typeface:** the guidelines say none is selected, so the page uses the system sans-serif stack (no webfont requests). Revisit when a typeface is chosen.
- **Layout:** three genuine layouts, not one scaled design. Stacked (phones, portrait tablets: fluid flex column, `clamp()` type, doorway sized from viewport height via container units); Split (900px+ landscape: CSS grid, text and countdown beside the doorway); Canvas (1025px+, aspect 5:4 or wider: the approved 1555×1012 reference, scaled as one piece). Only the canvas layout uses a fixed design size.
- **Doorway:** an original inline SVG scene (arch, lit reveal, bunk-bed room, lamp, floor light). It is decorative and `aria-hidden`; the reference screenshot is not used as an image. It is not an official brand asset.
- **Colour:** the five brand colours, plus a headline tint blended from Nook Violet and Soft Lavender, and a warm lamp colour inside the room scene.
- **Footer:** two small inline icons (calendar, link) as in the reference.

## Known gaps

- **No Open Graph image.** No official 1200×630 share image exists, so `og:image` is omitted and none was invented. The twitter card is `summary`. Link previews will have no picture until one is made.
- **No `og:url` or canonical link**, because the domain is not secured.
- The page is indexable (no `noindex`). Consider adding `<meta name="robots" content="noindex">` until legal review is done.
- No brand font files exist.
