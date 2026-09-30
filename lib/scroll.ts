import type Lenis from "lenis";

// The one Lenis instance, registered by <SmoothScroll /> while it is mounted,
// so navigation code can scroll with the same inertia as the wheel.
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

function scrollTo(target: number, onComplete?: () => void) {
  if (!lenis) {
    window.scrollTo(0, target);
    onComplete?.();
    return;
  }
  // Lenis skips a scrollTo whose target equals its own idea of where it
  // already is; resync first if that idea has drifted from the real position.
  if (lenis.targetScroll === target && Math.abs(window.scrollY - target) > 1) {
    lenis.scrollTo(window.scrollY, { immediate: true });
  }
  lenis.scrollTo(target, { onComplete });
}

// `immediate` jumps: for a new page that replaces one scrolled down.
export function scrollToTop(immediate = false) {
  if (!immediate) scrollTo(0);
  else if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

// Back to the top in step with a panel sliding open (0.5s ease-in-out, the
// strips' transition in SiteShell.module.css): the nav panel sits at the very
// top of the page, so opened from a slightly scrolled page it would be cut off.
export function scrollToTopWithPanel() {
  if (!lenis) {
    window.scrollTo(0, 0);
    return;
  }
  lenis.scrollTo(0, {
    duration: 0.5,
    easing: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  });
}

// To the About section ("Over"), which starts where the hero ends. The
// hero's height, not a measured position: a panel that is still sliding shut
// would be measured along.
// `immediate` lands there without travelling: for arriving from a page that
// had no hero to scroll past.
export function scrollPastHero(immediate = false) {
  const hero = document.getElementById("hero-screen");
  if (!hero) return;
  if (!immediate) scrollTo(hero.offsetHeight);
  else if (lenis) {
    // The page has just grown; Lenis would clamp to the old one's length.
    lenis.resize();
    lenis.scrollTo(hero.offsetHeight, { immediate: true });
  } else window.scrollTo(0, hero.offsetHeight);
}

// Leaving a project: its hero grows back into the carousel, which has to be
// seen, so the page returns to the hero first and only then goes home. An
// interrupted scroll (the visitor takes over) never calls `leave`.
export function scrollToTopThen(leave: () => void) {
  if (window.scrollY < 1) leave();
  else scrollTo(0, leave);
}

// Opening a project keeps the hero where it is and only nudges the page far
// enough for the project's intro to rise into the lower half of the screen.
export function revealProject() {
  const content = document.getElementById("project-content");
  if (!content) return;
  // Resolved against the real scroll position: given an element, Lenis adds
  // its own `animatedScroll`, which can be stale after a lone native scroll
  // (e.g. a restored position) and then resolves to the wrong place.
  scrollTo(content.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5);
}
