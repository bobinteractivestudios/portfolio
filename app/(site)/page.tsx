import About from "@/components/About";
import styles from "@/components/SiteShell.module.css";

export default function Home() {
  return (
    <section id="about" className={styles.nextSection}>
      <About />
    </section>
  );
}
