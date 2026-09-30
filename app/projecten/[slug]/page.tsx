import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/projects";
import styles from "@/components/Project.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projecten/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Bob van Boekel`,
    description: project.description.join(" "),
  };
}

export default async function ProjectPage({ params }: PageProps<"/projecten/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article>
      <header className={styles.hero}>
        <span className={styles.kicker}>{project.kicker}</span>
        <h1 className={styles.title}>{project.title}</h1>
        <div className={styles.description}>
          {project.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </header>

      <div className={styles.images}>
        {[project.hero, ...project.images].map((image, i) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
            className={styles.image}
            priority={i === 0}
          />
        ))}
      </div>
    </article>
  );
}
