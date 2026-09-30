"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { projects } from "@/lib/projects";
import styles from "./ProjectsPanel.module.css";

const ProjectsPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function ProjectsPanel(
  { isOpen },
  ref
) {
  return (
    <aside ref={ref} id="site-projects" className={styles.panel} aria-hidden={!isOpen}>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.slug} className={styles.item}>
            <Link href={`/projecten/${project.slug}`} tabIndex={isOpen ? 0 : -1}>
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
});

export default ProjectsPanel;
