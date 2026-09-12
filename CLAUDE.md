# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## About AGENTS.md

`AGENTS.md` is regenerated automatically by `next dev` (see `node_modules/next/dist/server/lib/generate-agent-files.js`) and warns that this project runs a Next.js version newer than your training data, with breaking API/convention changes. Before writing Next.js-specific code (routing, fonts, metadata, config), check the matching guide under `node_modules/next/dist/docs/01-app/` rather than relying on prior knowledge. Don't fight the regenerated block in diffs — just commit it along with your change.

## Commands

```bash
npm run dev      # start the dev server (Turbopack), http://localhost:3001 by default per .claude/launch.json
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Architecture

Single-page portfolio built with Next.js App Router, React 19, TypeScript, and CSS Modules (no Tailwind/UI kit). `app/page.tsx` renders `<SiteShell><HeroSlideshow /></SiteShell>` — everything else lives in `components/`.

### The filmstrip navigation pattern (`SiteShell.tsx`)

The nav and "Projecten" reveal are **not** overlays or accordions — the whole visible page (header, hero, margin chrome) is one rigid sheet that physically slides to expose a hidden panel sitting behind it, like a strip of film moving past a fixed camera. This went through several failed designs (position:fixed panels revealed by a sliding cover, self-animating height/width panels) before landing here; don't reintroduce those without a reason, they broke either the "everything moves together" feel or caused an SSR flash.

Structure (outer to inner):
- `.hStrip` (horizontal flex row): `<ProjectsPanel>` + `.vStrip`. Its `transform: translateX()` is driven by `-projectsSize.width` (from `useMeasure`, `lib/useMeasure.ts`) when the Projecten panel is closed, `0` when open. This is what pushes the whole page right to reveal Projects on the left.
- `.vStrip` (vertical flex column): `<NavPanel>` + `.page`. Its `transform: translateY()` works the same way with `-navSize.height`, pushing the page down to reveal the nav above the logo.
- Both panels are normal in-flow siblings of the page content inside their strip — not absolutely positioned — so pushing one into view is a single `transform` on the strip, not a separate reveal animation on the panel itself.
- `activePanel` (`"none" | "nav" | "projects"`) in `SiteShell` is the only state; the two panels are mutually exclusive.

**SSR flash guard**: `navSize`/`projectsSize` start at `0` until `useMeasure`'s `ResizeObserver` fires client-side, so the very first server-rendered HTML would briefly compute `translateX(-0px)` — i.e. render as "open". `.hStrip` has `visibility: hidden` as an unconditional CSS default (true from the first byte of HTML, verified via `curl`), and `SiteShell` only flips it to `visible` after a mount-time `useEffect` confirms the transform is correct. Don't replace this with a JS-computed fallback value (a large offscreen number was tried — it breaks page positioning during the unmeasured window); the CSS-default-hidden approach is the one that actually works because it doesn't depend on JS having run yet.

### Margin system

`--page-margin` (`app/globals.css`, `clamp(20px, 4vw, 56px)`) is the one spacing value the whole layout is built around — hero image insets, `Header`, `NavPanel`/`ProjectsPanel` padding, and `MarginContact`/`ProjectsTrigger` all reference it so the thick-margin look stays consistent at every breakpoint. `--header-h` is a secondary constant used only to roughly vertically align `ProjectsPanel`'s content with the hero.

### Hero section

- `#hero-screen` (`.heroScreen` in `SiteShell.module.css`) is the first full-viewport section; `min-height` is declared with both `100vh` and `100dvh` (dvh second, so it wins where supported) — plain `vh` overshoots on mobile Safari because it ignores the collapsing toolbar. A second, currently-empty `.nextSection` (also full-height) exists so the page has somewhere to scroll to.
- `HeroSlideshow.tsx` handles three interactions on the same image stack: autoplay (a `setInterval` cross-fade with scripted shrink → slide → magnify keyframes), drag-to-swipe (Framer Motion `drag="x"`, no `dragConstraints` — that option was tried and broke the release/snap-back animation, so don't add it back), and the resulting scale is *derived* from the live drag offset via `useTransform` rather than separately animated, so drag and release use the same math. Autoplay pauses while `isDragging` is true.
- Page-load entrance: `.frame` (`HeroSlideshow.module.css`) zooms from `scale(1.08)` to `1` while `.heroScreen`'s side/bottom padding animates from `0` to `var(--page-margin)`, in sync (same duration/easing) — the effect is "start zoomed into the image fullscreen, zoom out into the margin layout." Both are plain CSS `@keyframes`, deliberately not Framer Motion, so they can't fight the per-frame `transform` writes Framer Motion does on the slide elements.

### Scrolling

`SmoothScroll.tsx` mounts a global Lenis instance for inertia-style wheel/touch scrolling (heavier duration + reduced `wheelMultiplier` than Lenis defaults, by design). There is no scroll-snap — an elastic-resistance-at-the-hero-boundary version was built and then explicitly removed; if it comes back, drive it off `lenis.targetScroll`, not the `scroll` value from Lenis's `scroll` event, which lags a fast gesture by the full animation duration and made the earlier attempts miscalculate direction/threshold.

### Fonts

Maison Neue (`app/fonts/maison-neue/*.ttf`, Light/Book/Bold) is loaded via `next/font/local` in `app/layout.tsx` as `--font-maison`. No Google Fonts.

### Deployment

Vercel project `portfolio` (`.vercel/project.json`), custom domain `bobvanboekel.nl` connected via two A records at Hostnet (`216.150.1.1`, `216.150.16.1`) rather than switching nameservers.
