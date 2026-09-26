"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, type Variants } from "framer-motion";
import styles from "./About.module.css";

const skills = [
  "Architectonisch ontwerp (modellen, tekeningen, visualisaties)",
  "Websites",
  "Grafische vormgeving",
  "Bijles (o.a. wiskunde)",
];

const introLines = [
  "Hi, ik ben Bob. Ik ben een leergierig en ijverig iemand die graag creatief bezig is in verschillende gebieden.",
  "Deze website etaleert wat van mijn werken. Ik ben beschikbaar voor verschillende diensten.",
  "Neem gerust contact met me op en hopelijk kan ik iets voor jou betekenen.",
];

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const skillsList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const introList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const lineReveal: Variants = {
  hidden: { y: "100%" },
  visible: { y: "0%" },
};

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const portraitWrapRef = useRef<HTMLDivElement>(null);
  const portraitFollowerRef = useRef<HTMLDivElement>(null);
  const portraitY = useMotionValue(0);

  // `position: sticky` doesn't stick here: .hStrip/.vStrip in SiteShell carry a
  // permanent CSS transform (the filmstrip nav pattern), and a transformed
  // ancestor breaks native sticky positioning. getBoundingClientRect() still
  // reports the true composited position, so the same "stick, then release
  // once the bottom catches up" behavior is reproduced by hand every frame.
  useAnimationFrame(() => {
    const about = aboutRef.current;
    const wrap = portraitWrapRef.current;
    const follower = portraitFollowerRef.current;
    if (!about || !wrap || !follower) return;

    const stickyOffset = parseFloat(getComputedStyle(about).paddingTop) || 0;
    const wrapRect = wrap.getBoundingClientRect();
    const followerHeight = follower.offsetHeight;

    const desiredTop = Math.min(
      Math.max(wrapRect.top, stickyOffset),
      wrapRect.bottom - followerHeight
    );

    portraitY.set(desiredTop - wrapRect.top);
  });

  return (
    <div className={styles.about} ref={aboutRef}>
      <div className={styles.top}>
        <motion.div
          className={styles.intro}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={introList}
        >
          {introLines.map((line, index) => (
            <span key={index} className={styles.lineMask}>
              <motion.span
                className={styles.line}
                variants={lineReveal}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.div>

        <div className={styles.portraitWrap} ref={portraitWrapRef}>
          <motion.div
            ref={portraitFollowerRef}
            className={styles.portraitFollower}
            style={{ y: portraitY }}
          >
            <motion.div
              className={styles.portrait}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            >
              <Image
                src="/images/portrait.jpg"
                alt="Bob van Boekel"
                fill
                sizes="(max-width: 700px) 40vw, 220px"
                className={styles.portraitImage}
                style={{ objectFit: "cover" }}
                priority={false}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className={styles.skillsBlock}>
        <motion.span
          className={styles.skillsLabel}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: EASE }}
        >
          SKILLS
        </motion.span>

        <motion.ul
          className={styles.skills}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={skillsList}
        >
          {skills.map((skill) => (
            <motion.li key={skill} variants={fadeUp} transition={{ duration: 0.6, ease: EASE }}>
              {skill}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
