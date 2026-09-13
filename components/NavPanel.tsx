"use client";

import { forwardRef } from "react";
import styles from "./NavPanel.module.css";

const NavPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function NavPanel(
  { isOpen },
  ref
) {
  return (
    <nav ref={ref} id="site-nav" className={styles.panel} aria-hidden={!isOpen}>
      <div className={styles.inner}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <a href="#about" tabIndex={isOpen ? 0 : -1}>
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
});

export default NavPanel;
