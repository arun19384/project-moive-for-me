# Do Young — marketing / how-to-use site

A standalone **static** landing page for the Do Young (ดูยัง?) app. No build step, no
dependencies — just HTML, CSS and vanilla JS. It mirrors the app's dark-gold theme.

```
website/
├── index.html   # the whole page (nav, hero, features, how-to, interactive demo, install, badges, footer)
├── styles.css   # design tokens (copied from app/globals.css) + all styles
├── app.js       # theme toggle, PWA install, platform tabs, interactive demo, scroll reveal
├── README.md    # this file
└── assets/
    └── icon.png # logo / favicon / OG image (copied from ../public/icon.png)
```

## View it locally

- **Quickest:** double-click `index.html` (opens via `file://`).
- **Recommended** (needed for the PWA install button + correct relative paths):

  ```bash
  npx serve website
  # or
  cd website && python -m http.server 8080
  ```

  Then open the printed URL (e.g. http://localhost:8080).

## Interactive demo (the `#tour` section)

Instead of a video, the site has a **click-through walkthrough** — a CSS phone mockup whose
screen swaps between five steps (add → rate → shelf → stats → badge). Visitors drive it with
**Next / Back**, the **← →** arrow keys, or by tapping the glowing hotspots on the screen itself.

- Copy for each step lives in the `DEMO` array at the top of the demo block in `app.js`.
- Each step's screen is a `.screen[data-screen="N"]` element in `index.html`; the active one
  gets `.active`. The bottom-nav highlight, progress dots and per-screen animations
  (rating fill, shelf pop-in, milestone bar, badge sparkle) are all wired in `app.js`.
- It respects `prefers-reduced-motion` (skips the tap-delay animation).

## Things to fill in later

| What | Where | How |
|---|---|---|
| **App URL** | `app.js`, top → `const APP_URL` | Set to the deployed app (e.g. `https://do-young.vercel.app/shelf`). Defaults to `/shelf`. |
| **Real screenshots** | hero phone mockup in `index.html` (`.phone`) | Currently a CSS-rendered mockup. Swap in real screenshots if you'd like. |

## Notes

- The theme toggle reads/writes the same `dy:theme` localStorage key the app uses.
- The **Install** button appears automatically on browsers that fire `beforeinstallprompt`
  (Chrome/Edge desktop & Android). iOS Safari shows the manual "Add to Home Screen" steps
  instead (Apple doesn't expose a programmatic install). The install tab auto-selects based
  on the visitor's platform; if already installed, an "Already installed ✓" note shows.
- Fully responsive and respects `prefers-reduced-motion`.

## Deploy

It's static, so drop the `website/` folder onto any host — Vercel, Netlify, GitHub Pages,
Cloudflare Pages, or an S3/R2 bucket. No configuration required.
