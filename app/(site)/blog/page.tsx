import type { Metadata } from "next";
import Link from "next/link";
import { posts, formatDate } from "@/lib/posts";
import styles from "@/components/Blog.module.css";

export const metadata: Metadata = {
  title: "Blog — Bob van Boekel",
  description: "Blog van Bob van Boekel.",
};

export default function Blog() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.kicker}>Schrijfsels</span>
        <h1 className={styles.title}>Blog</h1>
      </header>

      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.item}>
            <Link href={`/blog/${post.slug}`} className={styles.itemLink}>
              <time dateTime={post.date} className={styles.date}>
                {formatDate(post.date)}
              </time>
              <h2 className={styles.itemTitle}>{post.title}</h2>
              <p className={styles.excerpt}>{post.body[0]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
