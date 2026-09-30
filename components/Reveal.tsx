"use client";

import { createContext, useContext, type ReactNode, type Ref } from "react";
import { motion, type Variants } from "framer-motion";
import styles from "./Reveal.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;
// The exit is the reveal run backwards, so it eases in where the reveal eases
// out, and is quicker: it stands between the visitor and the next page.
const EASE_IN = [0.7, 0, 0.84, 0] as const;

// True while the page is leaving (set by SiteShell): every reveal plays its
// exit, whether it is on screen or not.
export const LeavingContext = createContext(false);

const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  exit: { opacity: 0, y: 28, transition: { duration: 0.4, ease: EASE_IN } },
};

// From just below its own line, behind the mask (.mask in the CSS).
const lift: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1, ease: EASE } },
  exit: { y: "110%", transition: { duration: 0.45, ease: EASE_IN } },
};

// Once, when the top of the element is a little way into the viewport. By
// margin rather than by visible fraction, so a block taller than the screen
// still triggers.
const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "0px 0px -12% 0px" },
} as const;

const tags = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
  figure: motion.figure,
  ul: motion.ul,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  time: motion.time,
  h1: motion.h1,
  h2: motion.h2,
};

type Props = {
  as?: keyof typeof tags;
  className?: string;
  children: ReactNode;
};

// Scroll reveals for the text pages (blog, programme). A RevealGroup plays
// when it scrolls into view and brings its Reveal and RevealLine children in
// one after another, however deep they sit inside it. When the page leaves it
// takes them out again, last one first.
export function RevealGroup({
  as = "div",
  id,
  ref,
  ...props
}: Props & { id?: string; ref?: Ref<HTMLElement> }) {
  const isLeaving = useContext(LeavingContext);
  const Tag = tags[as] as typeof motion.div;
  return (
    <Tag
      id={id}
      ref={ref as Ref<HTMLDivElement>}
      variants={group}
      {...(isLeaving ? { animate: "exit" } : inView)}
      {...props}
    />
  );
}

// Fades in while rising. `solo` plays on its own scroll position instead of
// with a RevealGroup around it.
export function Reveal({ as = "div", solo = false, ...props }: Props & { solo?: boolean }) {
  const isLeaving = useContext(LeavingContext);
  const Tag = tags[as] as typeof motion.div;
  const own = solo ? (isLeaving ? { animate: "exit" } : inView) : null;
  return <Tag variants={rise} {...own} {...props} />;
}

// A line of heading that rises out from behind its own baseline.
export function RevealLine({ as = "div", className = "", children }: Props) {
  const Tag = tags[as] as typeof motion.div;
  return (
    <Tag className={`${styles.mask} ${className}`}>
      <motion.span className={styles.line} variants={lift}>
        {children}
      </motion.span>
    </Tag>
  );
}
