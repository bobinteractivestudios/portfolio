"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { projects } from "@/lib/projects";
import { revealProject } from "@/lib/scroll";
import { useTypewriter } from "@/lib/useTypewriter";
import styles from "./HeroSlideshow.module.css";

const slides = projects.map((project, i) => ({
  image: project.hero.src,
  href: `/projecten/${project.slug}`,
  title: project.title,
  label: `[${String(i + 1).padStart(2, "0")}] ${project.kicker.toLowerCase()}: ${project.title}`,
}));
const images = slides.map((slide) => slide.image);
// The custom properties are read by .slide, see HeroSlideshow.module.css. A
// hero on a backdrop gets a second layer over the photo, the same size, that
// fades its bottom edge into the backdrop: a shadow running off the bottom of
// the photo would otherwise end in a hard line.
const slideStyles = projects.map(({ hero }) => {
  const photo = `url(${hero.src})`;
  const fade = hero.backdrop && `linear-gradient(transparent 88%, ${hero.backdrop.color})`;
  return {
    backgroundImage: fade ? `${fade}, ${photo}` : photo,
    "--portrait-position": hero.portraitPosition,
    "--backdrop": hero.backdrop?.color,
    "--landscape-size": hero.backdrop?.size,
  } as CSSProperties;
});
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
// The shrink and slide legs of the auto-advance transition, on their own, and
// how far (in frame widths) a slide travels to be out of the frame.
const SHRINK_DURATION = DURATION * TIMES[1];
const SLIDE_DURATION = DURATION * (TIMES[2] - TIMES[1]);
const OFFSCREEN = 1.15;

type DragInfo = { offset: { x: number }; velocity: { x: number } };

// `hidden`: the page has no hero (blog, programme). The slide leaves like one
// in an autoplay transition, shrinking first and then sliding out of the
// frame, and `onHidden` reports when it is gone; it comes back the same way
// in reverse, sliding in and then growing.
export default function HeroSlideshow({
  hidden,
  onHidden,
}: {
  hidden: boolean;
  onHidden: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDir, setDragDir] = useState<1 | -1>(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(1);
  const x = useMotionValue(0);
  // Where the slide is while the page has no hero: see `hidden`.
  const hideY = useMotionValue(0);
  const isOffstage = useRef(hidden);
  const hasEntered = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // On /projecten/[slug] the carousel is that project's hero: it shows the
  // project's slide and holds it (no autoplay). -1 on the home page.
  const routeIndex = slides.findIndex((slide) => slide.href === pathname);
  const isProjectOpen = routeIndex !== -1;
  const [lastRouteIndex, setLastRouteIndex] = useState(routeIndex);
  const [lastHidden, setLastHidden] = useState(hidden);
  if (hidden !== lastHidden) {
    setLastHidden(hidden);
    // Leaves only the slide that carries `x`, which is the one that moves.
    setPrevIndex(null);
  }
  // The project whose title lies under the hero (see .title in the CSS). It
  // outlives the route by the time the hero takes to grow back over it.
  const [titleIndex, setTitleIndex] = useState<number | null>(isProjectOpen ? routeIndex : null);
  if (routeIndex !== lastRouteIndex) {
    setLastRouteIndex(routeIndex);
    if (isProjectOpen) {
      setActiveIndex(routeIndex);
      setPrevIndex(null);
      setTitleIndex(routeIndex);
    }
  }

  const peekX = useTransform(x, (v) => (v < 0 ? widthRef.current + v : -widthRef.current + v));

  const scaleFromOffset = (v: number) => {
    // Leaving for a page without a hero moves `x` too, but is no drag.
    if (isOffstage.current) return 1;
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
    if (isDragging || !CAN_SLIDE || isProjectOpen || hidden) return;
    const id = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((current) => (current + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [activeIndex, isDragging, isProjectOpen, hidden]);

  useEffect(() => {
    const small = 1 - SHRINK_AMOUNT;
    const restScale = isProjectOpen ? small : 1;
    const shrink = { duration: SHRINK_DURATION, ease: "easeInOut" } as const;
    const slide = { duration: SLIDE_DURATION, ease: "easeInOut" } as const;
    const isLandscape = window.innerWidth > window.innerHeight;
    // On page load the slide makes the same entrance as on the way back from
    // a page without a hero: it starts out where it would have left to. (The
    // shell stays hidden until it has mounted, so this start is never seen.)
    if (!hasEntered.current) {
      hasEntered.current = true;
      if (!hidden) {
        if (isLandscape) hideY.set(OFFSCREEN * window.innerHeight);
        else x.set(OFFSCREEN * window.innerWidth);
        openScale.set(small);
      }
    }
    const isAway = Math.abs(x.get()) > 1 || Math.abs(hideY.get()) > 1;
    let controls;
    isOffstage.current = hidden || isAway;
    if (hidden) {
      // Out by the shorter way: down on a landscape screen, sideways (like the
      // carousel) on a portrait one. The viewport's size stands in for the
      // frame's, which has none while its screen is collapsed.
      const leave = { ...slide, delay: SHRINK_DURATION, onComplete: onHidden };
      controls = [
        animate(openScale, small, shrink),
        isLandscape
          ? animate(hideY, OFFSCREEN * window.innerHeight, leave)
          : animate(x, -OFFSCREEN * window.innerWidth, leave),
      ];
    } else if (isAway) {
      // Back from having been hidden: up again from below, or, having left
      // sideways, in from the right as a carousel slide enters.
      if (x.get() < 0) x.set(OFFSCREEN * window.innerWidth);
      controls = [
        animate(x, 0, { ...slide, onComplete: () => (isOffstage.current = false) }),
        animate(hideY, 0, slide),
        animate(openScale, restScale, { ...shrink, delay: SLIDE_DURATION }),
      ];
    } else {
      controls = [animate(openScale, restScale, shrink)];
    }
    return () => controls.forEach((control) => control.stop());
  }, [hidden, isProjectOpen, openScale, x, hideY, onHidden]);

  useEffect(() => {
    if (isProjectOpen) return;
    const timeout = setTimeout(() => setTitleIndex(null), SHRINK_DURATION * 1000);
    return () => clearTimeout(timeout);
  }, [isProjectOpen]);

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
    if (pathname === href) router.push("/", { scroll: false });
    else router.push(href, { scroll: false });
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
  // The slide label types itself out, and deletes itself when a project opens
  // or the slide changes. Its first entrance waits for the slide's own
  // entrance on page load.
  const labelText = useTypewriter(isProjectOpen || hidden ? "" : active.label, 1000);

  return (
    <>
      {/* data-own-click: SiteShell's click-anywhere-to-close leaves the hero to
          its own tap handling, which tells a tap from a swipe. */}
      <div className={styles.frame} ref={frameRef} data-own-click>
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
              className={
                `${styles.slide} ${styles.current} ${CAN_SLIDE ? styles.draggable : ""} ` +
                `${isProjectOpen ? styles.closable : ""}`
              }
              style={{ ...slideStyles[activeIndex], x, y: hideY, scale: currentScale }}
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
      {titleIndex !== null && (
        <Link
          href={slides[titleIndex].href}
          scroll={false}
          className={`${styles.label} ${styles.title}`}
          onClick={(event) => {
            event.preventDefault();
            // The title of the open project nudges the page down to its intro.
            if (isProjectOpen) revealProject();
          }}
        >
          {slides[titleIndex].title}
        </Link>
      )}
      {/* Typed out and deleted rather than mounted and unmounted, so it stays
          until the last character of its exit is gone. */}
      {((!isProjectOpen && !hidden) || labelText !== "") && (
        <Link
          href={active.href}
          scroll={false}
          className={styles.label}
          aria-label={active.label}
          onClick={(event) => {
            event.preventDefault();
            if (!isProjectOpen && !hidden) toggleActive();
          }}
        >
          {labelText}
        </Link>
      )}
    </>
  );
}
