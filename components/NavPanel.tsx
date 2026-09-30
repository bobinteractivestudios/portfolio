"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavPanel.module.css";

const NavPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function NavPanel(
  { isOpen },
  ref
) {
  const isHome = usePathname() === "/";

  return (
    <nav ref={ref} id="site-nav" className={styles.panel} aria-hidden={!isOpen}>
      <div className={styles.inner}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link href="/program" scroll={false} tabIndex={isOpen ? 0 : -1}>
              Programma
            </Link>
          </li>
          <li className={styles.item}>
            <Link href="/blog" scroll={false} tabIndex={isOpen ? 0 : -1}>
              Blog
            </Link>
          </li>
          <li className={styles.item}>
            {isHome ? (
              <a href="#about" tabIndex={isOpen ? 0 : -1}>
                Over
              </a>
            ) : (
              <Link href="/#about" scroll={false} tabIndex={isOpen ? 0 : -1}>
                Over
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
});

export default NavPanel;
