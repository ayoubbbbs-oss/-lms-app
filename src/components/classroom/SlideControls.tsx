"use client";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export default function SlideControls({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  isFirst,
  isLast,
  disabled,
  onFirst,
  onLast,
}: {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  onFirst?: () => void;
  onLast?: () => void;
}) {
  const btn =
    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 bg-slate-200/80 hover:bg-slate-300 text-slate-600 disabled:opacity-25 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1";

  return (
    <div className="flex items-center justify-center gap-3 px-5 py-2 bg-slate-100 border-t border-slate-200 flex-shrink-0">
      <button onClick={onFirst} disabled={disabled || isFirst} className={btn} title="First slide">
        <ChevronsLeft size={16} />
      </button>
      <button onClick={onPrev} disabled={disabled || isFirst} className={btn} title="Previous slide">
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm font-semibold text-slate-600 tabular-nums min-w-[80px] text-center select-none">
        {currentSlide + 1} of {totalSlides}
      </span>

      <button onClick={onNext} disabled={disabled || isLast} className={btn} title="Next slide">
        <ChevronRight size={16} />
      </button>
      <button onClick={onLast} disabled={disabled || isLast} className={btn} title="Last slide">
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
