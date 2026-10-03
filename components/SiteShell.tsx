"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMotionValueEvent, useScroll } from "framer-motion";
import Header from "./Header";
import NavPanel from "./NavPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProjectsTrigger from "./ProjectsTrigger";
import MarginContact from "./MarginContact";
import SmoothScroll from "./SmoothScroll";
import HeroSlideshow from "./HeroSlideshow";
import FrozenRouter from "./FrozenRouter";
import { LeavingContext } from "./Reveal";
import { useMeasure } from "@/lib/useMeasure";
import {
  revealProject,
  scrollPastHero,
  scrollToTop,
  scrollToTopThen,
  scrollToTopWithPanel,
} from "@/lib/scroll";
import styles from "./SiteShell.module.css";

type Panel = "none" | "nav" | "projects";

// The blog and the programme: pages of their own inside the shell, without
// the hero. Only its top bar stays (.heroCollapsed).
const isContentPath = (path: string) => path !== "/" && !path.startsWith("/projecten/");

// How long a blog or programme page takes to leave: its reveals played
// backwards (Reveal.tsx) and the rest faded (.mainLeaving).
const EXIT_MS = 650;

// Whether the hero has left the viewport, given the height of an open nav
// panel above it. From layout sizes rather than a measured position, which
// would include a strip that is still sliding.
const isPastHero = (hero: HTMLElement | null, navOffset = 0) =>
  hero !== null && window.scrollY >= hero.offsetHeight + navOffset - 1;

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The page on screen. It follows the address at once, except when leaving
  // a blog or programme page: that stays (FrozenRouter) while it plays its
  // exit, and only then makes way. Everything that lays out the page follows
  // this rather than the address, so the next page only starts coming in
  // (the hero, the new page's reveals) once the old one is gone.
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath && !isContentPath(shownPath)) setShownPath(pathname);
  const isLeaving = pathname !== shownPath;
  useEffect(() => {
    if (!isLeaving) return;
    const timeout = setTimeout(() => setShownPath(pathname), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [isLeaving, pathname]);
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [navRef, navSize] = useMeasure<HTMLElement>();
  const [projectsRef, projectsSize] = useMeasure<HTMLElement>();
  const [ready, setReady] = useState(false);
  // Turns the strips' transitions on, a couple of frames after `ready`, so the
  // jump to their measured offsets on page load is not animated.
  const [animated, setAnimated] = useState(false);

  const isNavOpen = activePanel === "nav";
  const isProjectsOpen = activePanel === "projects";

  // A click outside the open panel shuts it, and does nothing else: it is
  // caught before it reaches the page, so it can't also open a project or
  // follow a link. The logo and the Projecten trigger keep their own toggles.
  useEffect(() => {
    if (activePanel === "none") return;
    const panelId = activePanel === "nav" ? "site-nav" : "site-projects";
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest(`#${panelId}, [aria-controls="site-nav"], [aria-controls="site-projects"]`)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setActivePanel("none");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [activePanel]);

  // The close cross and back-to-top arrow of an open project only show once
  // the hero (and the header that scrolls away with it) has left the viewport.
  const heroRef = useRef<HTMLDivElement>(null);
  const [pastHero, setPastHero] = useState(false);
  // Whether they have been on screen on this page, so their exit only plays
  // when there is something to take away.
  const [actionsShown, setActionsShown] = useState(false);
  const { scrollY } = useScroll();
  // An open nav panel is part of the page and scrolls away with it. The fixed
  // chrome, pushed down by the panel's height, rides back up with it for as
  // long as the panel is in view (`translate`, on top of the transform below).
  const chromeRef = useRef<HTMLDivElement>(null);
  const navHeight = navSize.height;
  useMotionValueEvent(scrollY, "change", (y) => {
    const past = isPastHero(heroRef.current, isNavOpen ? navHeight : 0);
    setPastHero(past);
    if (past) setActionsShown(true);
    if (chromeRef.current && isNavOpen) {
      chromeRef.current.style.translate = `0 ${-Math.min(y, navHeight)}px`;
    }
  });
  useEffect(() => {
    if (!chromeRef.current) return;
    chromeRef.current.style.translate = `0 ${isNavOpen ? -Math.min(scrollY.get(), navHeight) : 0}px`;
  }, [isNavOpen, navHeight, scrollY]);

  const isHome = shownPath === "/";
  const isProjectOpen = shownPath.startsWith("/projecten/");
  const isContentPage = isContentPath(shownPath);
  // Arriving on one, the hero first leaves (HeroSlideshow's `hidden`); only
  // once it is gone does its screen collapse and the page's content come in.
  const [heroGone, setHeroGone] = useState(isContentPage);
  const onHeroHidden = useCallback(() => setHeroGone(true), []);
  const isHeroCollapsed = isContentPage && heroGone;
  // There is no hero to scroll past there, so the corner glyphs always show.
  const showActions = pastHero || isHeroCollapsed;
  // Going home happens at the hero, where a project's transition back into
  // the carousel plays: from further down the page it scrolls up there first.
  // A blog or programme page instead leaves from where it is.
  const goHome = () => {
    const leave = () => router.push("/", { scroll: false });
    if (isContentPage) leave();
    else scrollToTopThen(leave);
  };

  // The shell stays mounted across / and /projecten/[slug] (it is their shared
  // layout), so a link inside a panel has to close that panel itself.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActivePanel("none");
  }
  const [lastShownPath, setLastShownPath] = useState(shownPath);
  if (shownPath !== lastShownPath) {
    setLastShownPath(shownPath);
    setActionsShown(false);
    if (!isContentPage) setHeroGone(false);
  }

  // Only the content below the hero changes on navigation, and the links pass
  // `scroll: false`, so the scroll position is ours to move: back to the top
  // (where HeroSlideshow animates an opening project), or to the About section
  // for "Over" from another page.
  const lastPathname = useRef<string | null>(null);
  useEffect(() => {
    if (lastPathname.current === shownPath) return;
    const isFirstLoad = lastPathname.current === null;
    const wasContentPage = !isFirstLoad && isContentPath(lastPathname.current!);
    lastPathname.current = shownPath;
    if (isFirstLoad) return;
    // After a blog or programme page, which has left the screen empty, the
    // new page starts in place instead of being scrolled to: the hero is put
    // back above the fold unseen for "Over", and the top is jumped to.
    if (isHome && window.location.hash === "#about") scrollPastHero(wasContentPage);
    else if (!isHome || !window.location.hash) scrollToTop(wasContentPage);
  }, [shownPath, isHome]);

  // The strip's resting transform depends on navSize/projectsSize, which are
  // only known once the client has measured the panels. The server-rendered
  // HTML (and the first paint before hydration) can't know that value, so it
  // would briefly render with a 0px offset - i.e. the panels open. `.hStrip`
  // stays hidden via CSS by default (no JS required for that part) and is
  // only revealed here, once we're certain the transform is correct.
  useEffect(() => {
    setReady(true);
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`${styles.shell} ${animated ? styles.shellAnimated : ""}`}>
      <SmoothScroll />

      {/* The margin chrome can't live inside the strips: their transform would
          make `position: fixed` relative to the strip instead of the viewport.
          It sits in its own fixed layer and gets the same offset and
          transition as the strips, so it still moves as one sheet with them.
          The header is not part of it: it scrolls away with the hero. */}
      <div
        ref={chromeRef}
        className={`${styles.chrome} ${isNavOpen ? styles.chromeRiding : ""}`}
        style={{
          transform: `translate(${isProjectsOpen ? projectsSize.width : 0}px, ${
            isNavOpen ? navSize.height : 0
          }px)`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {/* Clicking anywhere on an open project closes it, except in the side
            margins: these swallow the click and keep the normal pointer. */}
        {isProjectOpen && (
          <>
            <div className={`${styles.gutter} ${styles.gutterLeft}`} />
            <div className={`${styles.gutter} ${styles.gutterRight}`} />
          </>
        )}
        <ProjectsTrigger
          isOpen={isProjectsOpen}
          onToggle={() => setActivePanel((p) => (p === "projects" ? "none" : "projects"))}
        />
        <MarginContact />
        {!isHome && (
          <div
            className={
              `${styles.actions} ` +
              `${showActions ? styles.actionsVisible : actionsShown ? styles.actionsLeaving : ""}`
            }
            aria-hidden={!showActions}
          >
            {/* Both glyphs are built from one vertical line: see the entrance
                in SiteShell.module.css. */}
            <div className={styles.rig}>
              {[styles.whole, styles.halfTop, styles.halfBottom].map((part) => (
                <svg key={part} className={`${styles.strand} ${part}`} aria-hidden="true">
                  <line x1="7" y1="0" x2="7" y2="100%" />
                </svg>
              ))}
              <Link
                href="/"
                scroll={false}
                className={styles.action}
                onClick={(event) => {
                  event.preventDefault();
                  goHome();
                }}
                aria-label="Sluiten"
                tabIndex={showActions ? 0 : -1}
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <g className={styles.cross}>
                    <path className={styles.stem} d="M7 1v12" />
                    <path className={styles.crossBar} d="M7 1v12" />
                  </g>
                </svg>
              </Link>
              <button
                type="button"
                className={styles.action}
                onClick={() => scrollToTop()}
                aria-label="Terug naar boven"
                tabIndex={showActions ? 0 : -1}
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path className={styles.stem} d="M7 1v12" />
                  <path className={styles.flankLeft} d="M7 1v5.5" />
                  <path className={styles.flankRight} d="M7 1v5.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={styles.hStrip}
        style={{
          transform: `translateX(${isProjectsOpen ? 0 : -projectsSize.width}px)`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <ProjectsPanel
          ref={projectsRef}
          isOpen={isProjectsOpen}
          onSelect={(href) => {
            // Picking the project that is already open doesn't change the
            // pathname, so nothing above would close the panel or scroll.
            if (href !== pathname) return;
            setActivePanel("none");
            revealProject();
          }}
        />

        <div
          className={styles.vStrip}
          style={{ transform: `translateY(${isNavOpen ? 0 : -navSize.height}px)` }}
        >
          <NavPanel ref={navRef} isOpen={isNavOpen} />

          <div
            className={`${styles.page} ${isProjectOpen ? styles.pageClosable : ""}`}
            onClick={(event) => {
              if (!isProjectOpen) return;
              // Links, buttons and the hero keep their own behaviour.
              if ((event.target as Element).closest("a, button, [data-own-click]")) return;
              goHome();
            }}
          >
            <main className={isLeaving ? styles.mainLeaving : undefined}>
              <div
                id="hero-screen"
                className={`${styles.heroScreen} ${isHeroCollapsed ? styles.heroCollapsed : ""}`}
                ref={heroRef}
              >
                <div className={styles.topBar}>
                  <Header
                    isOpen={isNavOpen}
                    onToggle={() => {
                      // The logo can be clicked from a slightly scrolled page.
                      if (!isNavOpen && window.scrollY > 0) scrollToTopWithPanel();
                      setActivePanel((p) => (p === "nav" ? "none" : "nav"));
                    }}
                  />
                </div>
                <HeroSlideshow hidden={isContentPage} onHidden={onHeroHidden} />
              </div>
              {/* A blog or programme page only mounts once the hero is gone, so
                  its scroll reveals (Reveal.tsx) play when it can be seen. */}
              <LeavingContext.Provider value={isLeaving}>
                {(!isContentPage || isHeroCollapsed) && (
                  <FrozenRouter key={shownPath}>{children}</FrozenRouter>
                )}
              </LeavingContext.Provider>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
