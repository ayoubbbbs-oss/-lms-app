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
  // Parse structured notes: look for Task/Answers/Ask/Next slide patterns
  const parseNotes = (raw: string) => {
    const sections: { label: string; content: string }[] = [];
    const lines = raw.split("\n");
    let currentLabel = "Notes";
    let currentContent: string[] = [];

    for (const line of lines) {
      const match = line.match(/^(Task|Answers|Ask|Objective|Can do|Next slide|KEY POINT|MAIN ACTIVITY)[:\s]*(.*)/i);
      if (match) {
        if (currentContent.length > 0) {
          sections.push({ label: currentLabel, content: currentContent.join("\n").trim() });
        }
        currentLabel = match[1];
        currentContent = match[2] ? [match[2]] : [];
      } else {
        currentContent.push(line);
      }
    }
    if (currentContent.length > 0) {
      sections.push({ label: currentLabel, content: currentContent.join("\n").trim() });
    }
    return sections.length > 0 ? sections : [{ label: "Notes", content: raw }];
  };

  const navBtn = "w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-500 disabled:opacity-30 transition-colors";

  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
      {/* Orange notebook header — matches Off2Class exactly */}
      <div className="h-3 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 flex-shrink-0" />
      <div className="flex items-center justify-center py-2">
        <h2 className="text-orange-500 text-sm font-bold uppercase tracking-wider">
          Teacher Notes
        </h2>
      </div>

      {/* Lesson title box — dark purple like Off2Class */}
      {lessonTitle && (
        <div className="mx-3 mb-1">
          <div className="bg-[#2d2252] text-white text-xs font-bold px-3 py-1.5 rounded-t-sm">
            {lessonTitle}
          </div>
          {slideTitle && (
            <div className="bg-[#e8740c] text-white text-xs font-semibold px-3 py-1 rounded-b-sm">
              {slideTitle}
            </div>
          )}
        </div>
      )}

      {/* CEFR + Objective + Can do — structured like Off2Class */}
      <div className="mx-3 text-xs space-y-1 mb-2 flex-shrink-0">
        {cefrLevel && (
          <div className="flex gap-2">
            <span className="font-bold text-gray-700 w-16 flex-shrink-0">CEFR</span>
            <span className="text-gray-600">{cefrLevel}</span>
          </div>
        )}
      </div>

      {/* Notes content — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {notes ? (
              <div className="space-y-2">
                {parseNotes(notes).map((section, i) => (
                  <div key={i}>
                    {section.label !== "Notes" && (
                      <p className="text-xs font-bold text-gray-800 mb-0.5">
                        {section.label}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={20} className="mx-auto text-gray-300 mb-1.5" />
                <p className="text-xs text-gray-400">No notes for this slide</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Copyright like Off2Class */}
      <div className="px-3 py-1 flex-shrink-0">
        <p className="text-[9px] text-gray-300">Off2Lougha Learning Platform</p>
      </div>

      {/* Bottom: CEFR badge + Timer + Slide nav — matches Off2Class exactly */}
      <div className="border-t border-gray-200 px-3 py-2 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">CEFR</span>
            {cefrLevel && (
              <span className="bg-white border border-gray-300 text-xs font-bold text-gray-700 px-2 py-0.5 rounded">
                {cefrLevel}
              </span>
            )}
          </div>
        </div>

        <div className="text-[10px] text-gray-400 mb-2">
          Total Time: <span className="text-gray-600">00:00</span>
          {" / "}
          Current Slide: <span className="text-gray-600">00:00</span>
        </div>

        {/* Slide navigation arrows — gray circles like Off2Class */}
        {totalSlides && onPrev && onNext && (
          <div className="flex items-center gap-2">
            <button onClick={onFirst} disabled={isFirst} className={navBtn}>
              <ChevronsLeft size={14} />
            </button>
            <button onClick={onPrev} disabled={isFirst} className={navBtn}>
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-gray-600 tabular-nums min-w-[50px] text-center">
              {slideIndex + 1} of {totalSlides}
            </span>
            <button onClick={onNext} disabled={isLast} className={navBtn}>
              <ChevronRight size={14} />
            </button>
            <button onClick={onLast} disabled={isLast} className={navBtn}>
              <ChevronsRight size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
