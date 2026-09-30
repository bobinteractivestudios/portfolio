import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
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

// Rendered by SiteShell below the hero: the carousel slide is this page's
// hero image, so only the intro and the rest of the gallery live here.
export default async function ProjectPage({ params }: PageProps<"/projecten/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article id="project-content" key={project.slug} className={styles.project}>
      <h1 className={styles.srOnly}>{project.title}</h1>

      <div className={styles.intro}>
        {project.description.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className={styles.images}>
        {project.images.map((image) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
            className={styles.image}
          />
        ))}
      </div>

      <Footer />
    </article>
  );
}
