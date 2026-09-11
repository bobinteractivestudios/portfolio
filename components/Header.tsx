"use client";

import styles from "./Header.module.css";

export default function Header({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.logo}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="site-nav"
      >
        Bob van Boekel
      </button>
    </header>
  );
}
