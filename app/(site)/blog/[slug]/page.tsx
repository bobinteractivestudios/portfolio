import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, RevealGroup, RevealLine } from "@/components/Reveal";
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
      <RevealGroup as="header" className={styles.hero}>
        <Reveal as="span" className={styles.kicker}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </Reveal>
        <RevealLine as="h1" className={styles.postTitle}>
          {post.title}
        </RevealLine>
      </RevealGroup>

      <div className={styles.body}>
        {post.quote && (
          <RevealGroup as="figure" className={styles.quote}>
            <blockquote>
              {post.quote.text.map((line, i) => (
                <Reveal as="p" key={i}>
                  {line}
                </Reveal>
              ))}
            </blockquote>
            <figcaption className={styles.caption}>
              <Reveal as="span">{post.quote.source}</Reveal>
            </figcaption>
          </RevealGroup>
        )}
        {post.body.map((paragraph, i) => (
          <Reveal as="p" solo key={i}>
            {paragraph}
          </Reveal>
        ))}
      </div>

      <Link href="/blog" scroll={false} className={styles.allPosts}>
        ← Alle posts
      </Link>
    </article>
  );
}
