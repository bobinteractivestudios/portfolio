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

Single-page portfolio built with Next.js App Router, React 19, TypeScript, and CSS Modules (no Tailwind/UI kit). `app/(site)/layout.tsx` wraps the home page and `/projecten/[slug]` in `<SiteShell>`, which renders the hero carousel itself and the route's page below it — everything else lives in `components/`. `/blog`, `/blog/[slug]` and `/program` are in that group too: they share the shell (so navigation never reloads it) but not the hero: arriving on one, the slide first leaves like one in an autoplay transition (shrink, then slide out: downwards on a landscape screen, the shorter way, and off to the left on a portrait one; `hidden`/`onHidden` on `HeroSlideshow`), then `.heroCollapsed` shrinks the hero screen to its top bar and only then is the page's content mounted. Leaving one plays an exit first: `SiteShell` keeps showing the old page (`shownPath` lags the address; `components/FrozenRouter.tsx` pins the page's router context so Next doesn't swap it) for `EXIT_MS` while `LeavingContext` runs every reveal backwards, then lays out the new page, jumping rather than scrolling to its start. Layout decisions (`isHome`, `isContentPage`, the hero's `hidden`, the scroll effect) follow `shownPath`, not the address, so the next page only starts once the old one is gone. The content is mounted, so its scroll reveals (`components/Reveal.tsx`: `RevealGroup` staggers its `Reveal`/`RevealLine` children in when it scrolls into view) play where they can be seen. The hero is hidden rather than unmounted, so on the way home it slides back in (up from below, or from the right) and grows instead of replaying its page-load entrance. There is no footer; the way back is the corner cross, which always shows on these pages.

### The filmstrip navigation pattern (`SiteShell.tsx`)

The nav and "Projecten" reveal are **not** overlays or accordions — the whole visible page (header, hero, margin chrome) is one rigid sheet that physically slides to expose a hidden panel sitting behind it, like a strip of film moving past a fixed camera. This went through several failed designs (position:fixed panels revealed by a sliding cover, self-animating height/width panels) before landing here; don't reintroduce those without a reason, they broke either the "everything moves together" feel or caused an SSR flash.

Structure (outer to inner):
- `.hStrip` (horizontal flex row): `<ProjectsPanel>` + `.vStrip`. Its `transform: translateX()` is driven by `-projectsSize.width` (from `useMeasure`, `lib/useMeasure.ts`) when the Projecten panel is closed, `0` when open. This is what pushes the whole page right to reveal Projects on the left.
- `.vStrip` (vertical flex column): `<NavPanel>` + `.page`. Its `transform: translateY()` works the same way with `-navSize.height`, pushing the page down to reveal the nav above the logo.
- Both panels are normal in-flow siblings of the page content inside their strip — not absolutely positioned — so pushing one into view is a single `transform` on the strip, not a separate reveal animation on the panel itself.
- `activePanel` (`"none" | "nav" | "projects"`) in `SiteShell` is the only state; the two panels are mutually exclusive.

**SSR flash guard**: `navSize`/`projectsSize` start at `0` until `useMeasure`'s `ResizeObserver` fires client-side, so the very first server-rendered HTML would briefly compute `translateX(-0px)` — i.e. render as "open". `.hStrip` has `visibility: hidden` as an unconditional CSS default (true from the first byte of HTML, verified via `curl`), and `SiteShell` only flips it to `visible` after a mount-time `useEffect` confirms the transform is correct. The strips' and chrome's `transition` only switches on a couple of frames later (`.shellAnimated`), otherwise that first jump from 0px to the measured offsets would be eased and the panels would be seen sliding shut on every page load. Don't replace this with a JS-computed fallback value (a large offscreen number was tried — it breaks page positioning during the unmeasured window); the CSS-default-hidden approach is the one that actually works because it doesn't depend on JS having run yet.

### Single-page project navigation

`/` and `/projecten/[slug]` share `SiteShell` as their layout, so opening a project never remounts the shell: the hero carousel stays put (it *is* the project's hero image) and only the content below it swaps — `About` on the home page, the project's intro + gallery (`#project-content`) on a project page. Projects live in `lib/projects.ts`, which drives the carousel slides, the Projecten panel and the pages.

- Every link between these routes passes `scroll: false`; `SiteShell` owns the scroll position instead (`lib/scroll.ts`): on a pathname change it scrolls back to the top, and when a project opens `HeroSlideshow` plays the shrink leg of the autoplay transition on the slide and holds it at 0.86 for as long as the project is open (an `openScale` motion value multiplied into the drag-derived scales). Clicking the hero of the project that is already open is the inverse: it navigates home and the slide grows back into the carousel. Clicking the open project's title (or picking it again in the Projecten panel) nudges the page down to its intro instead (`revealProject`). On an open project a click anywhere on the page closes it (`closeProject` in `SiteShell`, pointer `--cursor-close`), except on links/buttons and in the side margins (`.gutter`); closing navigates home straight away, from wherever the page is scrolled to. Give Lenis a numeric target, not the element — see the comment in `lib/scroll.ts`.
- `HeroSlideshow` derives the open project from `usePathname()`: while a project is open it holds that slide (no autoplay), swiping navigates to the neighbouring project, the grey mono slide label in the bottom margin deletes itself (`lib/useTypewriter.ts`: characters scramble while the text shrinks one at a time at random pauses; it comes back as the exact reverse, noise growing to full length and then resolving into the text) and is replaced by the project title in the logo's bold type, centred under the shrunk image in the room the shrink frees up. The title has no entrance of its own: it lies under the full-size image (`.frame` is stacked above it) and the shrink uncovers it; `titleIndex` keeps it mounted while the hero grows back over it. A compact × in the top-right corner of the fixed chrome returns home, with a back-to-top arrow directly below it (`.actions` in `SiteShell`); both are compact line glyphs that only appear once the page has scrolled past the hero (`pastHero`), with a CSS entrance in which one vertical line swoops in, parts in two and unfolds into the cross and the arrow, and an exit that plays it backwards. The exit's animations must not reuse an `animation-name` the entrance uses on the same element: the browser then keeps the old, finished animation instead of starting a new one (pausing and seeking animations in a test hides this, so check it in real time).
- **Fixed margin chrome**: `ProjectsTrigger`, `MarginContact` and an open project's close/back-to-top glyphs live in `.chrome`, a `position: fixed` layer *outside* the strips (a transformed ancestor would make `fixed` relative to the strip). It gets the same translate + transition as the strips so it still moves with them as one sheet. `Header` (the logo) is deliberately *not* in it: it sits in `.topBar` inside `.heroScreen`, filling the hero's top margin, and scrolls away with the page. Because the chrome is usable on a scrolled page, the `ProjectsPanel` list follows the scroll position (`useScroll` → `y`) so it is in view. The `NavPanel` is static: it sits at the top of the document and scrolls away with the page, and while it is open the chrome (pushed down by its height) rides back up with it via the `translate` property, leaving `transform` to the panel transitions.

### Margin system

`--page-margin` (`app/globals.css`, `clamp(20px, 4vw, 56px)`) is the one spacing value the whole layout is built around — hero image insets, `Header`, `NavPanel`/`ProjectsPanel` padding, and `MarginContact`/`ProjectsTrigger` all reference it so the thick-margin look stays consistent at every breakpoint. `--header-h` is a secondary constant used only to roughly vertically align `ProjectsPanel`'s content with the hero.

### Hero section

- `#hero-screen` (`.heroScreen` in `SiteShell.module.css`) is the first full-viewport section; `min-height` is declared with both `100vh` and `100dvh` (dvh second, so it wins where supported) — plain `vh` overshoots on mobile Safari because it ignores the collapsing toolbar. A second, currently-empty `.nextSection` (also full-height) exists so the page has somewhere to scroll to.
- `HeroSlideshow.tsx` handles three interactions on the same image stack: autoplay (a `setInterval` cross-fade with scripted shrink → slide → magnify keyframes), drag-to-swipe (Framer Motion `drag="x"`, no `dragConstraints` — that option was tried and broke the release/snap-back animation, so don't add it back), and the resulting scale is *derived* from the live drag offset via `useTransform` rather than separately animated, so drag and release use the same math. Autoplay pauses while `isDragging` is true.
- Page-load entrance: the slide comes in the way it returns from a page without a hero (see below): it starts out of the frame at 0.86 scale, slides in (up from below on a landscape screen, from the right on a portrait one) and then grows to full size. It is the same Framer Motion code path as that return, not a CSS animation; the earlier CSS zoom-out entrance (`frameZoomOut`/`heroMarginIn`) is gone.

### Scrolling

`SmoothScroll.tsx` mounts a global Lenis instance for inertia-style wheel/touch scrolling (heavier duration + reduced `wheelMultiplier` than Lenis defaults, by design). There is no scroll-snap — an elastic-resistance-at-the-hero-boundary version was built and then explicitly removed; if it comes back, drive it off `lenis.targetScroll`, not the `scroll` value from Lenis's `scroll` event, which lags a fast gesture by the full animation duration and made the earlier attempts miscalculate direction/threshold.

### Fonts

Maison Neue (`app/fonts/maison-neue/*.ttf`, Light/Book/Bold) is loaded via `next/font/local` in `app/layout.tsx` as `--font-maison`. No Google Fonts.

### Deployment

Vercel project `portfolio` (`.vercel/project.json`), custom domain `bobvanboekel.nl` connected via two A records at Hostnet (`216.150.1.1`, `216.150.16.1`) rather than switching nameservers.
