"use client";

import { useEffect, useRef, useState } from "react";

const NOISE = "abcdefghijklmnopqrstuvwxyz0123456789[]:/#%&*<>_-+=";
// How often the unsettled characters are re-rolled, in ms.
const NOISE_INTERVAL = 40;
// A character is added or removed after a random pause of up to this, in ms.
const MAX_PAUSE = 25;

// Spaces stay spaces, so the noise keeps the shape of the words.
const noise = (text: string) =>
  Array.from(text, (c) => (c === " " ? c : NOISE[Math.floor(Math.random() * NOISE.length)])).join(
    ""
  );

// Types `target` out as noise: the text grows one character at a time, each
// after a random pause, every character flickering through random ones, and
// resolves into `target` once it has its full length. When `target` changes,
// what is showing is first deleted by the same thing in reverse: it turns to
// noise and shrinks one character at a time. An empty `target` just deletes.
// `startDelay` (ms) holds back the very first run only.
export function useTypewriter(target: string, startDelay = 0) {
  const [shown, setShown] = useState("");
  // The text being typed or deleted, and how many of its characters show.
  const state = useRef({ text: "", count: 0 });
  const isFirstRun = useRef(true);

  useEffect(() => {
    const s = state.current;
    if (s.text === target && s.count === target.length) return;

    let stepTimer: ReturnType<typeof setTimeout>;
    let noiseTimer: ReturnType<typeof setInterval>;

    const render = () => {
      setShown(noise(s.text.slice(0, s.count)));
    };

    const finish = () => {
      clearInterval(noiseTimer);
      s.text = target;
      s.count = target.length;
      setShown(target);
    };

    const step = () => {
      if (s.text !== target) {
        if (s.count > 0) s.count--;
        if (s.count === 0) s.text = target;
      } else if (s.count < target.length) {
        s.count++;
      }
      if (s.text === target && s.count === target.length) {
        finish();
        return;
      }
      render();
      stepTimer = setTimeout(step, Math.random() * MAX_PAUSE);
    };

    stepTimer = setTimeout(
      () => {
        isFirstRun.current = false;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          finish();
          return;
        }
        noiseTimer = setInterval(render, NOISE_INTERVAL);
        step();
      },
      isFirstRun.current ? startDelay : 0
    );

    return () => {
      clearTimeout(stepTimer);
      clearInterval(noiseTimer);
    };
  }, [target, startDelay]);

  return shown;
}
