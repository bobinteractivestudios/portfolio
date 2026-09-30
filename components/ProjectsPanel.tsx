"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { projects } from "@/lib/projects";
import styles from "./ProjectsPanel.module.css";

const ProjectsPanel = forwardRef<
  HTMLElement,
  { isOpen: boolean; onSelect: (href: string) => void }
>(function ProjectsPanel({ isOpen, onSelect }, ref) {
  // The panel is as tall as the whole page; its list rides along with the
  // scroll position so it is in view wherever the panel is opened.
  const { scrollY } = useScroll();

  return (
    <aside ref={ref} id="site-projects" className={styles.panel} aria-hidden={!isOpen}>
      <motion.ul className={styles.list} style={{ y: scrollY }}>
        {projects.map((project) => (
          <li key={project.slug} className={styles.item}>
            <Link
              href={`/projecten/${project.slug}`}
              scroll={false}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => onSelect(`/projecten/${project.slug}`)}
            >
              {project.title}
            </Link>
          </li>
        ))}
      </motion.ul>
    </aside>
  );
});

export default ProjectsPanel;
