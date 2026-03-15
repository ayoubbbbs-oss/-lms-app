"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type UseSlideNavigationOptions = {
  totalSlides: number;
  initialSlide: number;
  onSlideChange: (slideIndex: number) => void;
  onPersist?: (slideIndex: number) => void;
  enabled: boolean; // false for students (teacher-driven)
};

export function useSlideNavigation({
  totalSlides,
  initialSlide,
  onSlideChange,
  onPersist,
  enabled,
}: UseSlideNavigationOptions) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPersistedSlide = useRef(initialSlide);

  const debouncedPersist = useCallback(
    (slideIndex: number) => {
      if (!onPersist) return;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        if (slideIndex !== lastPersistedSlide.current) {
          lastPersistedSlide.current = slideIndex;
          onPersist(slideIndex);
        }
      }, 3000);
    },
    [onPersist]
  );

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalSlides - 1, index));
      setDirection(clamped > currentSlide ? 1 : -1);
      setCurrentSlide(clamped);
      onSlideChange(clamped);
      debouncedPersist(clamped);
    },
    [totalSlides, currentSlide, onSlideChange, debouncedPersist]
  );

  const next = useCallback(() => {
    if (currentSlide < totalSlides - 1) goTo(currentSlide + 1);
  }, [currentSlide, totalSlides, goTo]);

  const prev = useCallback(() => {
    if (currentSlide > 0) goTo(currentSlide - 1);
  }, [currentSlide, goTo]);

  // Keyboard navigation (teacher only)
  useEffect(() => {
    if (!enabled) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, next, prev]);

  // External update (for students receiving broadcast)
  const setSlideFromExternal = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalSlides - 1, index));
      setDirection(clamped > currentSlide ? 1 : -1);
      setCurrentSlide(clamped);
    },
    [totalSlides, currentSlide]
  );

  // Persist on unmount
  useEffect(() => {
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      if (onPersist && currentSlide !== lastPersistedSlide.current) {
        onPersist(currentSlide);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentSlide,
    direction,
    next,
    prev,
    goTo,
    setSlideFromExternal,
    totalSlides,
    isFirst: currentSlide === 0,
    isLast: currentSlide === totalSlides - 1,
  };
}
