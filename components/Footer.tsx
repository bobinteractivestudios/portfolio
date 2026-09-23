import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.logo}>
        Bob van Boekel
      </Link>
      <nav aria-label="Sitemap">
        <ul className={styles.sitemap}>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
          <li>
            <Link href="/program">Programma</Link>
          </li>
          <li>
            <Link href="/#about">Contact</Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
