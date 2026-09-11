"use client";

import { forwardRef } from "react";
import styles from "./NavPanel.module.css";

const links = [
  { label: "Contact", href: "#contact" },
  {
    label: "insta: @bobvanboekel",
    href: "https://www.instagram.com/bobvanboekel",
    external: true,
  },
];

const NavPanel = forwardRef<HTMLElement, { isOpen: boolean }>(function NavPanel(
  { isOpen },
  ref
) {
  return (
    <nav ref={ref} id="site-nav" className={styles.panel} aria-hidden={!isOpen}>
      <div className={styles.inner}>
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.label} className={styles.item}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                tabIndex={isOpen ? 0 : -1}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});

export default NavPanel;
