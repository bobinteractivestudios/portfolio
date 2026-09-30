"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fractional sizes, not offsetWidth/offsetHeight: rounding them leaves the
    // page up to half a pixel off the fixed chrome it has to line up with.
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ width, height });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
