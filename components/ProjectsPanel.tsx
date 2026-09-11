"use client";

import { forwardRef } from "react";
import styles from "./ProjectsPanel.module.css";

const projects = ["Project 1", "Project 2", "Project 3"];

const ProjectsPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function ProjectsPanel(
  { isOpen },
  ref
) {
  return (
    <aside ref={ref} id="site-projects" className={styles.panel} aria-hidden={!isOpen}>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project} className={styles.item}>
            <a href="#" tabIndex={isOpen ? 0 : -1}>
              {project}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
});

export default ProjectsPanel;
