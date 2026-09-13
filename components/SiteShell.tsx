"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import NavPanel from "./NavPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProjectsTrigger from "./ProjectsTrigger";
import MarginContact from "./MarginContact";
import SmoothScroll from "./SmoothScroll";
import About from "./About";
import { useMeasure } from "@/lib/useMeasure";
import styles from "./SiteShell.module.css";

type Panel = "none" | "nav" | "projects";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [navRef, navSize] = useMeasure<HTMLElement>();
  const [projectsRef, projectsSize] = useMeasure<HTMLElement>();
  const [ready, setReady] = useState(false);

  const isNavOpen = activePanel === "nav";
  const isProjectsOpen = activePanel === "projects";

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
      <div
        className={styles.hStrip}
        style={{
          transform: `translateX(${isProjectsOpen ? 0 : -projectsSize.width}px)`,
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <ProjectsPanel ref={projectsRef} isOpen={isProjectsOpen} />

        <div
          className={styles.vStrip}
          style={{ transform: `translateY(${isNavOpen ? 0 : -navSize.height}px)` }}
        >
          <NavPanel ref={navRef} isOpen={isNavOpen} />

          <div className={styles.page}>
            <main>
              <div id="hero-screen" className={styles.heroScreen}>
                <Header
                  isOpen={isNavOpen}
                  onToggle={() => setActivePanel((p) => (p === "nav" ? "none" : "nav"))}
                />
                {children}
                <ProjectsTrigger
                  isOpen={isProjectsOpen}
                  onToggle={() =>
                    setActivePanel((p) => (p === "projects" ? "none" : "projects"))
                  }
                />
                <MarginContact />
              </div>
              <section id="about" className={styles.nextSection}>
                <About />
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
