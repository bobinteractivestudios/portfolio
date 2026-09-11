"use client";

import styles from "./ProjectsTrigger.module.css";

export default function ProjectsTrigger({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="site-projects"
      >
        Projecten
      </button>
    </div>
  );
}
