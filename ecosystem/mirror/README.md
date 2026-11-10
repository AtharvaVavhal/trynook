# Nook ecosystem directory / Mirror

Buildless HTML, CSS and vanilla JavaScript. No installation, bundler, framework,
external fonts or runtime dependencies. Approximately 35 KB of source before
HTTP compression, plus the existing official logo and favicon assets.

## Files and design

- `index.html`: semantic page shell, navigation, sections and social/SEO metadata.
- `mirror.css`: isolated brand tokens, editorial lavender hero, interactive
  ecosystem atlas, three-column directory, indigo overview, responsive layouts,
  accessible focus states and reduced-motion support. Uses the existing system
  font fallback; no local brand fonts are present.
- `platforms.js`: the only platform content source. Generates cards, atlas links,
  overview groups and footer links. Each known entry records its source HTML.
- `mirror.js`: rendering, search, category filtering, result announcements,
  mobile menu and scroll treatment.

Existing shared styles and the other sites are retained. The overview groups
are editorial focus areas, not asserted service dependencies. Coming Soon is
an editorial release label copied from the original pages, not live uptime.
No contact or legal links were added: the repository labels its contact address
a placeholder and provides no verified legal destinations.

## Content audit: one missing platform

The repository has **six**, not seven, platform pages and host routes:

| Platform | Verified destination | Source |
| --- | --- | --- |
| Management Dashboard | https://app.trynook.in/ | `ecosystem/app/index.html` |
| Nook for Residents | https://resident.trynook.in/ | `ecosystem/resident/index.html` |
| Super Admin | https://superadmin.trynook.in/ | `ecosystem/superadmin/index.html` |
| Platform API | https://api.trynook.in/ | `ecosystem/api/index.html` |
| Documentation | https://docs.trynook.in/ | `ecosystem/docs/index.html` |
| System Status | https://status.trynook.in/ | `ecosystem/status/index.html` |

All six returned HTTP 200 over HTTPS on 10 November 2026. This verifies page
availability, not product availability: they are Coming Soon pages. The main
About link redirects to www.trynook.in/about.html and then returns HTTP 200.

The seventh configuration entry has `url: null` and an explicit pending label.
It renders no link. Supply its exact name, HTTPS URL, description, release state
and category in `platforms.js`; cards, footer, atlas and overview update from
that entry. If it needs a new category, edit `categories` in that same file.
No seventh destination was invented or verified.

## Preview and checks

From the repository root:

```sh
node tools/dev-server.mjs
```

Open http://localhost:4173/?preview=mirror (or mirror.localhost:4173).

Browser verification uses an already installed Playwright; it is a development
check only, not a website dependency. In this environment:

```sh
TMPDIR=/private/tmp PLAYWRIGHT_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tools/verify-mirror.mjs
TMPDIR=/private/tmp PLAYWRIGHT_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tools/screenshots.mjs /tmp/nook-mirror-qa mirror
```

Checks cover 320, 390, 768, 1024 and 1440px; case-insensitive name/description
search; query trimming; empty state/reset; each category; combined search/filter;
configured card/atlas/footer URLs; unlinked placeholder; menu Escape and anchor
navigation; loaded images and assets; canonical, description and title; dynamic
year; reduced motion; sticky header; browser errors; horizontal overflow.
Routing checks cover all seven configured hosts (six existing plus Mirror),
asset exclusions, deep paths, the root domain and unrelated/lookalike hosts.
Screenshots at 390, 768 and 1440px are saved outside the repository.

Keyboard labels, focus styles, semantic headings, result announcements and
contrast were reviewed. This is not a full assistive-technology audit.

## Hosting and deployment

**Provider: Vercel**, established by `vercel.json`, repository tools and actual
HTTPS response headers. Git remote: https://github.com/AtharvaVavhal/trynook.git.
Current local branch: `master`. No Vercel project ID or account linkage is
checked into this repository. Do not create a replacement project.

`vercel.json` now adds an exact host route for `mirror.trynook.in` to
`/ecosystem/mirror/index.html`, with filesystem exceptions for its CSS/JS and
shared brand assets. The six previous host routes are unchanged.

At verification time, **mirror.trynook.in already resolved over HTTPS to Vercel
and returned the existing countdown page**. The new directory has NOT been
deployed. No DNS change was made or is indicated by that observation.

Deployment using the existing Vercel project:

1. Fill the seventh entry when its actual details are available. This may remain
   explicitly pending if publishing an incomplete directory is intentional.
2. Run the local checks above. Review `git diff` and stage the Mirror directory,
   `vercel.json`, `tools/dev-server.mjs`, `tools/routing.mjs`,
   `tools/screenshots.mjs`, and `tools/verify-mirror.mjs`.
3. Commit and push these reviewed files to the existing Git remote. Use the
   production branch configured in the existing Vercel project's Settings → Git;
   local `master` alone does not prove the connected production branch.
4. In that project's Settings → Domains, confirm `mirror.trynook.in` belongs to
   this project. Its current working HTTPS resolution does not establish which
   Vercel account/project owns it. Preserve existing domain settings.
5. Deploy the pushed commit through that project's normal production deployment
   workflow. Static project settings: repository root, no build command, output
   directory `.`. Retain equivalent existing settings if already configured.
   Alternatively, after linking this checkout to the verified existing project
   with `vercel link`, use `vercel deploy --prod` from the repository root.
6. Verify `https://mirror.trynook.in/` shows the directory title, not the countdown;
   request its CSS, JS and favicon; test search/mobile navigation; check all six
   existing subdomains still serve their own pages.

Do not change DNS unless the existing project's Domains panel establishes an
actual mismatch. Vercel project ownership and deployment were not changed here.
