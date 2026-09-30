"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll } from "framer-motion";
import styles from "./NavPanel.module.css";

const NavPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function NavPanel(
  { isOpen },
  ref
) {
  const isHome = usePathname() === "/";
  // The panel sits at the top of the document; riding along with the scroll
  // position keeps it just above the viewport, so it still slides in from the
  // top edge when the header is used on a scrolled page.
  const { scrollY } = useScroll();

  return (
    <motion.nav
      ref={ref}
      id="site-nav"
      className={styles.panel}
      aria-hidden={!isOpen}
      style={{ y: scrollY }}
    >
      <div className={styles.inner}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <a href="/program" tabIndex={isOpen ? 0 : -1}>
              Programma
            </a>
          </li>
          <li className={styles.item}>
            <Link href="/blog" tabIndex={isOpen ? 0 : -1}>
              Blog
            </Link>
          </li>
          <li className={styles.item}>
            {isHome ? (
              <a href="#about" tabIndex={isOpen ? 0 : -1}>
                Contact
              </a>
            ) : (
              <Link href="/#about" tabIndex={isOpen ? 0 : -1}>
                Contact
              </Link>
            )}
          </li>
        </ul>
      </div>
    </motion.nav>
  );
});

export default NavPanel;
