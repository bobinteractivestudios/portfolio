"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import styles from "./HeroSlideshow.module.css";

const images = ["/images/hero-1.svg", "/images/hero-2.svg", "/images/hero-3.svg"];

const INTERVAL = 4800;
const DURATION = 1.8;
const TIMES = [0, 0.33, 0.66, 1];
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;
const SNAP_DURATION = 0.5;
const SHRINK_AMOUNT = 0.14; // matches the 0.86 scale used in the auto-advance transition

type DragInfo = { offset: { x: number }; velocity: { x: number } };

export default function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDir, setDragDir] = useState<1 | -1>(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(1);
  const x = useMotionValue(0);

  const peekX = useTransform(x, (v) => (v < 0 ? widthRef.current + v : -widthRef.current + v));

  const scaleFromOffset = (v: number) => {
    const progress = Math.min(Math.abs(v) / widthRef.current, 1);
    return 1 - SHRINK_AMOUNT * progress;
  };
  const currentScale = useTransform(x, scaleFromOffset);
  const peekScale = useTransform(peekX, scaleFromOffset);

  const transitioning = prevIndex !== null;

  useEffect(() => {
    if (isDragging) return;
    const id = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((current) => (current + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [activeIndex, isDragging]);

  useEffect(() => {
    if (prevIndex === null) return;
    const timeout = setTimeout(() => setPrevIndex(null), DURATION * 1000);
    return () => clearTimeout(timeout);
  }, [prevIndex]);

  function goTo(dir: 1 | -1) {
    setActiveIndex((current) => (current + dir + images.length) % images.length);
  }

  function handleDragStart() {
    widthRef.current = frameRef.current?.offsetWidth || 1;
    setIsDragging(true);
  }

  function handleDrag(_: unknown, info: DragInfo) {
    setDragDir(info.offset.x < 0 ? 1 : -1);
  }

  function handleDragEnd(_: unknown, info: DragInfo) {
    const width = widthRef.current;
    const passed =
      Math.abs(info.offset.x) > SWIPE_DISTANCE_THRESHOLD ||
      Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

    if (passed) {
      const dir = info.offset.x < 0 ? 1 : -1;
      animate(x, dir === 1 ? -width : width, { duration: SNAP_DURATION, ease: "easeOut" }).then(
        () => {
          goTo(dir);
          x.set(0);
          setIsDragging(false);
        }
      );
    } else {
      animate(x, 0, { duration: SNAP_DURATION, ease: "easeOut" }).then(() =>
        setIsDragging(false)
      );
    }
  }

  return (
    <div className={styles.frame} ref={frameRef}>
      {transitioning ? (
        <>
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
          <motion.div
            key={`in-${activeIndex}`}
            className={styles.slide}
            style={{ backgroundImage: `url(${images[activeIndex]})` }}
            animate={{ scale: [0.86, 0.86, 0.86, 1], x: ["115%", "115%", "0%", "0%"] }}
            transition={{ duration: DURATION, times: TIMES, ease: "easeInOut" }}
          />
        </>
      ) : (
        <>
          {isDragging && (
            <motion.div
              className={styles.slide}
              style={{
                backgroundImage: `url(${images[(activeIndex + dragDir + images.length) % images.length]})`,
                x: peekX,
                scale: peekScale,
              }}
            />
          )}
          <motion.div
            key={`current-${activeIndex}`}
            className={styles.slide}
            style={{ backgroundImage: `url(${images[activeIndex]})`, x, scale: currentScale }}
            drag="x"
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        </>
      )}
    </div>
  );
}
