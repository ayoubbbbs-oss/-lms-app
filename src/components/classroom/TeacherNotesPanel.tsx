"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function TeacherNotesPanel({
  notes,
  slideIndex,
  slideTitle,
  lessonTitle,
  cefrLevel,
  totalSlides,
  onPrev,
  onNext,
  onFirst,
  onLast,
  isFirst,
  isLast,
}: {
  notes: string | null | undefined;
  slideIndex: number;
  slideTitle?: string;
  lessonTitle?: string;
  cefrLevel?: string | null;
  totalSlides?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const parseNotes = (raw: string) => {
    const sections: { label: string; content: string }[] = [];
    const lines = raw.split("\n");
    let currentLabel = "Notes";
    let currentContent: string[] = [];
    for (const line of lines) {
      const match = line.match(/^(Task|Answers|Ask|Objective|Can do|Next slide|KEY POINT|MAIN ACTIVITY)[:\s]*(.*)/i);
      if (match) {
        if (currentContent.length > 0) sections.push({ label: currentLabel, content: currentContent.join("\n").trim() });
        currentLabel = match[1];
        currentContent = match[2] ? [match[2]] : [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentContent.length > 0) sections.push({ label: currentLabel, content: currentContent.join("\n").trim() });
    return sections.length > 0 ? sections : [{ label: "Notes", content: raw }];
  };

  const navBtn = "w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-30 transition-colors";

  return (
    <aside className="flex flex-col flex-shrink-0 h-full">
      {/* Orange header — CHUNKY */}
      <div className="h-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 flex-shrink-0" />
      <div className="flex items-center justify-center py-4">
        <h2 className="text-orange-500 text-2xl font-extrabold uppercase tracking-wider">
          Teacher Notes
        </h2>
      </div>

      {/* Lesson title — BIG dark purple box */}
      {lessonTitle && (
        <div className="mx-4 mb-2">
          <div className="bg-[#2d2252] text-white text-xl font-bold px-4 py-4 rounded-t-sm flex items-center justify-between gap-3">
            <span className="flex-1">{lessonTitle}</span>
            {cefrLevel && (
              <span className="flex-shrink-0 bg-white/20 text-white text-sm font-extrabold px-3 py-1 rounded">
                {cefrLevel}
              </span>
            )}
          </div>
          {slideTitle && (
            <div className="bg-[#e8740c] text-white text-lg font-semibold px-4 py-3 rounded-b-sm">
              {slideTitle}
            </div>
          )}
        </div>
      )}

      {/* CEFR label */}
      <div className="mx-4 text-base space-y-1 mb-3 flex-shrink-0">
        {cefrLevel && (
          <div className="flex gap-3 items-center">
            <span className="font-bold text-gray-700">CEFR</span>
            <span className="text-gray-600 font-semibold">{cefrLevel}</span>
          </div>
        )}
      </div>

      {/* Notes content — scrollable, BIG text */}
      <div className="flex-1 overflow-y-auto px-4 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {notes ? (
              <div className="space-y-3">
                {parseNotes(notes).map((section, i) => (
                  <div key={i}>
                    {section.label !== "Notes" && (
                      <p className="text-base font-extrabold text-gray-800 mb-1">
                        {section.label}
                      </p>
                    )}
                    <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-base text-gray-400">No notes for this slide</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Copyright */}
      <div className="px-4 py-1.5 flex-shrink-0">
        <p className="text-xs text-gray-300">Off2Lougha Learning Platform</p>
      </div>

      {/* Bottom: CEFR + Timer + HUGE nav arrows */}
      <div className="border-t border-gray-200 px-4 py-3 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-500">CEFR</span>
            {cefrLevel && (
              <span className="bg-white border-2 border-gray-300 text-base font-extrabold text-gray-700 px-3 py-1 rounded">
                {cefrLevel}
              </span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-3 font-medium">
          Total Time: <span className="text-gray-600 font-semibold">00:00</span>
          {" / "}
          Current Slide: <span className="text-gray-600 font-semibold">00:00</span>
        </div>

        {/* HUGE slide nav arrows */}
        {totalSlides && onPrev && onNext && (
          <div className="flex items-center gap-3">
            <button onClick={onFirst} disabled={isFirst} className={navBtn}>
              <ChevronsLeft size={24} strokeWidth={3} />
            </button>
            <button onClick={onPrev} disabled={isFirst} className={navBtn}>
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <span className="text-lg font-bold text-gray-700 tabular-nums min-w-[70px] text-center">
              {slideIndex + 1} of {totalSlides}
            </span>
            <button onClick={onNext} disabled={isLast} className={navBtn}>
              <ChevronRight size={24} strokeWidth={3} />
            </button>
            <button onClick={onLast} disabled={isLast} className={navBtn}>
              <ChevronsRight size={24} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
