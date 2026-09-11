"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./HeroSlideshow.module.css";

const images = ["/images/hero-1.svg", "/images/hero-2.svg", "/images/hero-3.svg"];

const INTERVAL = 4800;
const DURATION = 1.8;
const TIMES = [0, 0.33, 0.66, 1];

export default function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((current) => (current + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [activeIndex]);

  useEffect(() => {
    if (prevIndex === null) return;
    const timeout = setTimeout(() => setPrevIndex(null), DURATION * 1000);
    return () => clearTimeout(timeout);
  }, [prevIndex]);

  const transitioning = prevIndex !== null;

  return (
    <div className={styles.frame}>
      {transitioning && (
        <motion.div
          key={`out-${prevIndex}`}
          className={styles.slide}
          style={{ backgroundImage: `url(${images[prevIndex as number]})` }}
          animate={{
            scale: [1, 0.86, 0.86, 0.86],
            x: ["0%", "0%", "-115%", "-115%"],
          }}
          transition={{ duration: DURATION, times: TIMES, ease: "easeInOut" }}
        />
      )}
      <motion.div
        key={`in-${activeIndex}`}
        className={styles.slide}
        style={{ backgroundImage: `url(${images[activeIndex]})` }}
        initial={transitioning ? undefined : { scale: 1.08 }}
        animate={
          transitioning
            ? { scale: [0.86, 0.86, 0.86, 1], x: ["115%", "115%", "0%", "0%"] }
            : { scale: 1, x: "0%" }
        }
        transition={
          transitioning
            ? { duration: DURATION, times: TIMES, ease: "easeInOut" }
            : { duration: 1.6, ease: "easeOut" }
        }
      />
    </div>
  );
}
