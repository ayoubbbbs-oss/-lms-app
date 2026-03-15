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
    "w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-500 disabled:opacity-30 transition-colors";

  return (
    <div className="flex items-center justify-center gap-2 py-2 bg-white border-t border-gray-200 flex-shrink-0">
      <button onClick={onFirst} disabled={disabled || isFirst} className={btn}>
        <ChevronsLeft size={14} />
      </button>
      <button onClick={onPrev} disabled={disabled || isFirst} className={btn}>
        <ChevronLeft size={14} />
      </button>

      <span className="text-xs font-semibold text-gray-600 tabular-nums min-w-[60px] text-center select-none">
        {currentSlide + 1} of {totalSlides}
      </span>

      <button onClick={onNext} disabled={disabled || isLast} className={btn}>
        <ChevronRight size={14} />
      </button>
      <button onClick={onLast} disabled={disabled || isLast} className={btn}>
        <ChevronsRight size={14} />
      </button>

      {/* Progress bar like Off2Class */}
      <div className="ml-4 flex gap-0.5">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= currentSlide ? "w-3 bg-orange-500" : "w-3 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
