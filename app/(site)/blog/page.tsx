import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealLine } from "@/components/Reveal";
import { posts, formatDate } from "@/lib/posts";
import styles from "@/components/Blog.module.css";

export const metadata: Metadata = {
  title: "Blog — Bob van Boekel",
  description: "Blog van Bob van Boekel.",
};

export default function Blog() {
  return (
    <>
      <RevealGroup as="header" className={styles.hero}>
        <Reveal as="span" className={styles.kicker}>
          Schrijfsels
        </Reveal>
        <RevealLine as="h1" className={styles.title}>
          Blog
        </RevealLine>
      </RevealGroup>

      <ul className={styles.list}>
        {posts.map((post) => (
          <RevealGroup as="li" key={post.slug} className={styles.item}>
            <Link href={`/blog/${post.slug}`} scroll={false} className={styles.itemLink}>
              <Reveal as="span" className={styles.date}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </Reveal>
              <RevealLine as="h2" className={styles.itemTitle}>
                {post.title}
              </RevealLine>
              <Reveal as="p" className={styles.excerpt}>
                {post.body[0]}
              </Reveal>
            </Link>
          </RevealGroup>
        ))}
      </ul>
    </>
  );
}
