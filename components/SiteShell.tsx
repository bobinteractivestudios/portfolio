"use client";

import { useState } from "react";
import Header from "./Header";
import NavPanel from "./NavPanel";
import ProjectsPanel from "./ProjectsPanel";
import ProjectsTrigger from "./ProjectsTrigger";
import MarginContact from "./MarginContact";
import SmoothScroll from "./SmoothScroll";
import { useMeasure } from "@/lib/useMeasure";
import styles from "./SiteShell.module.css";

type Panel = "none" | "nav" | "projects";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<Panel>("none");
  const [navRef, navSize] = useMeasure<HTMLElement>();
  const [projectsRef, projectsSize] = useMeasure<HTMLElement>();

  const isNavOpen = activePanel === "nav";
  const isProjectsOpen = activePanel === "projects";

  return (
    <div className={styles.shell}>
      <SmoothScroll />
      <div
        className={styles.hStrip}
        style={{ transform: `translateX(${isProjectsOpen ? 0 : -projectsSize.width}px)` }}
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
              <section className={styles.nextSection} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
