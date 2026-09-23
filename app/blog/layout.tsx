import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import styles from "@/components/Blog.module.css";

export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <div className={styles.page}>
      <SmoothScroll />

      <div className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>
          Bob van Boekel
        </Link>
        <Link href="/" className={styles.back}>
          ← Terug naar home
        </Link>
      </div>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <Link href="/">Bob van Boekel</Link>
        <div className={styles.footerContact}>
          <a href="tel:+31651775569">06 51 77 55 69</a>
          <a href="mailto:bob@van-boekel.nl">bob@van-boekel.nl</a>
        </div>
      </footer>
    </div>
  );
}
