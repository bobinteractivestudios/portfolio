import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, formatDate } from "@/lib/posts";
import styles from "@/components/Blog.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Bob van Boekel`,
    description: post.body[0],
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className={styles.article}>
      <header className={styles.hero}>
        <time dateTime={post.date} className={styles.kicker}>
          {formatDate(post.date)}
        </time>
        <h1 className={styles.postTitle}>{post.title}</h1>
      </header>

      <div className={styles.body}>
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <Link href="/blog" className={styles.allPosts}>
        ← Alle posts
      </Link>
    </article>
  );
}
