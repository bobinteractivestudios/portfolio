"use client";

import type { ReactNode, Ref } from "react";
import { motion, type Variants } from "framer-motion";
import styles from "./Reveal.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

// From just below its own line, behind the mask (.mask in the CSS).
const lift: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1, ease: EASE } },
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
// one after another, however deep they sit inside it.
export function RevealGroup({
  as = "div",
  id,
  ref,
  ...props
}: Props & { id?: string; ref?: Ref<HTMLElement> }) {
  const Tag = tags[as] as typeof motion.div;
  return <Tag id={id} ref={ref as Ref<HTMLDivElement>} variants={group} {...inView} {...props} />;
}

// Fades in while rising. `solo` plays on its own scroll position instead of
// with a RevealGroup around it.
export function Reveal({ as = "div", solo = false, ...props }: Props & { solo?: boolean }) {
  const Tag = tags[as] as typeof motion.div;
  return <Tag variants={rise} {...(solo ? inView : null)} {...props} />;
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
