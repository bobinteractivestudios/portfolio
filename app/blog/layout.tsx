import Link from "next/link";
import Footer from "@/components/Footer";
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

      <Footer />
    </div>
  );
}
