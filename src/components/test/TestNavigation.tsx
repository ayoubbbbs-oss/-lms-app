"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type Props = {
  currentQuestion: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  isFirst: boolean;
  isLast: boolean;
  hasAnswer: boolean;
};

export default function TestNavigation({
  currentQuestion,
  totalQuestions,
  onPrev,
  onNext,
  onFirst,
  onLast,
  isFirst,
  isLast,
  hasAnswer,
}: Props) {
  const navBtn =
    "w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-30 transition-colors";

  return (
    <div className="px-8 py-5 border-t border-gray-200 flex items-center justify-between">
      {/* Left: navigation circles */}
      <div className="flex items-center gap-3">
        <button onClick={onFirst} disabled={isFirst} className={navBtn}>
          <ChevronsLeft size={24} strokeWidth={3} />
        </button>
        <button onClick={onPrev} disabled={isFirst} className={navBtn}>
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <span className="text-lg font-bold text-gray-600 tabular-nums min-w-[100px] text-center">
          {currentQuestion} of {totalQuestions}
        </span>
        <button onClick={onNext} disabled={isLast} className={navBtn}>
          <ChevronRight size={24} strokeWidth={3} />
        </button>
        <button onClick={onLast} disabled={isLast} className={navBtn}>
          <ChevronsRight size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Right: action button */}
      <button
        onClick={onNext}
        disabled={!hasAnswer}
        className="flex items-center gap-3 bg-[#8CC641] hover:bg-[#7db838] disabled:opacity-40 text-white text-lg font-bold uppercase tracking-wider px-8 py-4 rounded-md transition-colors"
      >
        {isLast ? "FINISH TEST" : "NEXT QUESTION"}
        <ChevronRight size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
