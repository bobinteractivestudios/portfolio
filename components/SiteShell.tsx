"use client";

import { useEffect, useRef, useState } from "react";
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
import { useMeasure } from "@/lib/useMeasure";
import { revealProject, scrollToTop, scrollToTopThen } from "@/lib/scroll";
import styles from "./SiteShell.module.css";

type Panel = "none" | "nav" | "projects";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [navRef, navSize] = useMeasure<HTMLElement>();
  const [projectsRef, projectsSize] = useMeasure<HTMLElement>();
  const [ready, setReady] = useState(false);

  const isNavOpen = activePanel === "nav";
  const isProjectsOpen = activePanel === "projects";

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
    const hero = heroRef.current;
    const past = hero ? hero.getBoundingClientRect().bottom <= 0 : false;
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

  const isProjectOpen = pathname !== "/";
  // Closing a project happens at its hero, where the transition back into the
  // carousel plays: from further down the page it scrolls up there first.
  const closeProject = () => scrollToTopThen(() => router.push("/", { scroll: false }));

  // The shell stays mounted across / and /projecten/[slug] (it is their shared
  // layout), so a link inside a panel has to close that panel itself.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActivePanel("none");
    setActionsShown(false);
  }

  // Only the content below the hero changes on navigation, and the links pass
  // `scroll: false`, so the scroll position is ours to move: back to the hero,
  // which HeroSlideshow animates when a project opens.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (pathname !== "/" || !window.location.hash) scrollToTop();
  }, [pathname]);

  // The strip's resting transform depends on navSize/projectsSize, which are
  // only known once the client has measured the panels. The server-rendered
  // HTML (and the first paint before hydration) can't know that value, so it
  // would briefly render with a 0px offset - i.e. the panels open. `.hStrip`
  // stays hidden via CSS by default (no JS required for that part) and is
  // only revealed here, once we're certain the transform is correct.
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className={styles.shell}>
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
        {isProjectOpen && (
          <div
            className={
              `${styles.actions} ` +
              `${pastHero ? styles.actionsVisible : actionsShown ? styles.actionsLeaving : ""}`
            }
            aria-hidden={!pastHero}
          >
            {/* Both glyphs are built from one vertical line: see the entrance
                in SiteShell.module.css. */}
            <div className={styles.rig}>
              <svg className={styles.bridge} aria-hidden="true">
                <line x1="7" y1="0" x2="7" y2="100%" />
              </svg>
              <Link
                href="/"
                scroll={false}
                className={styles.action}
                onClick={(event) => {
                  event.preventDefault();
                  closeProject();
                }}
                aria-label="Project sluiten"
                tabIndex={pastHero ? 0 : -1}
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <g className={styles.cross}>
                    <path d="M7 1v12" />
                    <path className={styles.crossBar} d="M7 1v12" />
                  </g>
                </svg>
              </Link>
              <button
                type="button"
                className={styles.action}
                onClick={scrollToTop}
                aria-label="Terug naar boven"
                tabIndex={pastHero ? 0 : -1}
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M7 1v12" />
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
              closeProject();
            }}
          >
            <main>
              <div id="hero-screen" className={styles.heroScreen} ref={heroRef}>
                <div className={styles.topBar}>
                  <Header
                    isOpen={isNavOpen}
                    onToggle={() => setActivePanel((p) => (p === "nav" ? "none" : "nav"))}
                  />
                </div>
                <HeroSlideshow />
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
