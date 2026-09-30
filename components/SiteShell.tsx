"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import NavPanel from "./NavPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProjectsTrigger from "./ProjectsTrigger";
import MarginContact from "./MarginContact";
import SmoothScroll from "./SmoothScroll";
import HeroSlideshow from "./HeroSlideshow";
import { useMeasure } from "@/lib/useMeasure";
import { revealProject, scrollToTop } from "@/lib/scroll";
import styles from "./SiteShell.module.css";

type Panel = "none" | "nav" | "projects";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [navRef, navSize] = useMeasure<HTMLElement>();
  const [projectsRef, projectsSize] = useMeasure<HTMLElement>();
  const [ready, setReady] = useState(false);

  const isNavOpen = activePanel === "nav";
  const isProjectsOpen = activePanel === "projects";

  // The shell stays mounted across / and /projecten/[slug] (it is their shared
  // layout), so a link inside a panel has to close that panel itself.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setActivePanel("none");
  }

  // Only the content below the hero changes on navigation, and the links pass
  // `scroll: false`, so the scroll position is ours to move.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (pathname !== "/") revealProject();
    else if (!window.location.hash) scrollToTop();
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
          transition as the strips, so it still moves as one sheet with them. */}
      <div
        className={styles.chrome}
        style={{
          transform: `translate(${isProjectsOpen ? projectsSize.width : 0}px, ${
            isNavOpen ? navSize.height : 0
          }px)`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <div className={styles.topBar}>
          <Header
            isOpen={isNavOpen}
            onToggle={() => setActivePanel((p) => (p === "nav" ? "none" : "nav"))}
          />
        </div>
        <ProjectsTrigger
          isOpen={isProjectsOpen}
          onToggle={() => setActivePanel((p) => (p === "projects" ? "none" : "projects"))}
        />
        <MarginContact />
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

          <div className={styles.page}>
            <main>
              <div id="hero-screen" className={styles.heroScreen}>
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
