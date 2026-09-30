import styles from "@/components/Blog.module.css";

// Rendered by SiteShell below the hero, like a project's content.
export default function BlogLayout({ children }: LayoutProps<"/blog">) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
