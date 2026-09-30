"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { projects } from "@/lib/projects";
import { revealProject } from "@/lib/scroll";
import styles from "./HeroSlideshow.module.css";

const slides = projects.map((project, i) => ({
  image: project.hero.src,
  href: `/projecten/${project.slug}`,
  title: project.title,
  label: `[${String(i + 1).padStart(2, "0")}] ${project.kicker.toLowerCase()}: ${project.title}`,
}));
const images = slides.map((slide) => slide.image);
// Read by .slide on portrait phones, see HeroSlideshow.module.css.
const slideStyles = projects.map(
  (project) =>
    ({
      backgroundImage: `url(${project.hero.src})`,
      "--portrait-position": project.hero.portraitPosition,
    }) as CSSProperties
);
// Sliding a single slide onto itself looks like a glitch, so autoplay and
// drag only switch on once there is something to slide to.
const CAN_SLIDE = slides.length > 1;

const INTERVAL = 4800;
const DURATION = 1.8;
const TIMES = [0, 0.33, 0.66, 1];
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;
const SNAP_DURATION = 0.5;
const SHRINK_AMOUNT = 0.14; // matches the 0.86 scale used in the auto-advance transition
// The shrink leg of the auto-advance transition, on its own.
const SHRINK_DURATION = DURATION * TIMES[1];

type DragInfo = { offset: { x: number }; velocity: { x: number } };

export default function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDir, setDragDir] = useState<1 | -1>(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(1);
  const x = useMotionValue(0);
  const router = useRouter();
  const pathname = usePathname();

  // On /projecten/[slug] the carousel is that project's hero: it shows the
  // project's slide and holds it (no autoplay). -1 on the home page.
  const routeIndex = slides.findIndex((slide) => slide.href === pathname);
  const isProjectOpen = routeIndex !== -1;
  const [lastRouteIndex, setLastRouteIndex] = useState(routeIndex);
  const [hasNavigated, setHasNavigated] = useState(false);
  if (routeIndex !== lastRouteIndex) {
    setLastRouteIndex(routeIndex);
    setHasNavigated(true);
    if (isProjectOpen) {
      setActiveIndex(routeIndex);
      setPrevIndex(null);
    }
  }

  const peekX = useTransform(x, (v) => (v < 0 ? widthRef.current + v : -widthRef.current + v));

  const scaleFromOffset = (v: number) => {
    const progress = Math.min(Math.abs(v) / widthRef.current, 1);
    return 1 - SHRINK_AMOUNT * progress;
  };
  // An open project's hero stays at the shrunk size of the auto-advance
  // transition (it shrinks but never slides over), which frees the room under
  // it for the title (.open in the CSS). `openScale` multiplies into the
  // drag-derived scales rather than fighting them for the same property.
  const openScale = useMotionValue(isProjectOpen ? 1 - SHRINK_AMOUNT : 1);
  const scaleWhenOpen = ([offset, open]: number[]) => scaleFromOffset(offset) * open;
  const currentScale = useTransform([x, openScale], scaleWhenOpen);
  const peekScale = useTransform([peekX, openScale], scaleWhenOpen);

  const transitioning = prevIndex !== null;

  useEffect(() => {
    if (isDragging || !CAN_SLIDE || isProjectOpen) return;
    const id = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((current) => (current + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [activeIndex, isDragging, isProjectOpen]);

  useEffect(() => {
    const controls = animate(openScale, isProjectOpen ? 1 - SHRINK_AMOUNT : 1, {
      duration: SHRINK_DURATION,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [isProjectOpen, openScale]);

  useEffect(() => {
    if (prevIndex === null) return;
    const timeout = setTimeout(() => setPrevIndex(null), DURATION * 1000);
    return () => clearTimeout(timeout);
  }, [prevIndex]);

  function goTo(dir: 1 | -1) {
    const next = (activeIndex + dir + slides.length) % slides.length;
    setActiveIndex(next);
    // Swiping the hero of an open project opens the neighbouring project.
    if (isProjectOpen) router.push(slides[next].href, { scroll: false });
  }

  // The hero stays put and the project loads below it (see SiteShell), so
  // opening is a navigation without Next's own scroll handling. Tapping the
  // hero of the open project is the inverse: back home, where it grows back
  // into the carousel.
  function toggleActive() {
    const { href } = slides[activeIndex];
    router.push(pathname === href ? "/" : href, { scroll: false });
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

  const active = slides[activeIndex];

  return (
    <>
      <div className={styles.frame} ref={frameRef}>
        {transitioning ? (
          <>
            <motion.div
              key={`out-${prevIndex}`}
              className={styles.slide}
              style={slideStyles[prevIndex as number]}
              animate={{
                scale: [1, 0.86, 0.86, 0.86],
                x: ["0%", "0%", "-115%", "-115%"],
              }}
              transition={{ duration: DURATION, times: TIMES, ease: "easeInOut" }}
            />
            <motion.div
              key={`in-${activeIndex}`}
              className={styles.slide}
              style={slideStyles[activeIndex]}
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
                  ...slideStyles[(activeIndex + dragDir + images.length) % images.length],
                  x: peekX,
                  scale: peekScale,
                }}
              />
            )}
            <motion.div
              key={`current-${activeIndex}`}
              className={`${styles.slide} ${styles.current} ${CAN_SLIDE ? styles.draggable : ""}`}
              style={{ ...slideStyles[activeIndex], x, scale: currentScale }}
              drag={CAN_SLIDE ? "x" : false}
              dragMomentum={false}
              onTap={toggleActive}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            />
          </>
        )}
      </div>
      {/* Keyed per state so the label remounts and fades in again. */}
      <Link
        key={isProjectOpen ? `title-${activeIndex}` : "label"}
        href={active.href}
        scroll={false}
        className={
          `${styles.label} ${isProjectOpen ? styles.title : ""} ` +
          `${hasNavigated ? styles.instant : ""}`
        }
        onClick={(event) => {
          event.preventDefault();
          // The title of the open project nudges the page down to its intro.
          if (isProjectOpen) revealProject();
          else toggleActive();
        }}
      >
        {isProjectOpen ? active.title : active.label}
      </Link>
    </>
  );
}
