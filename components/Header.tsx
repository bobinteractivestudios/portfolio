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
      <a
        href="https://www.instagram.com/bobvanboekel"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.social}
        aria-label="Instagram"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </a>
    </header>
  );
}
