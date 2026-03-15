"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TeacherNotesPanel({
  notes,
  slideIndex,
  slideTitle,
  lessonTitle,
  cefrLevel,
}: {
  notes: string | null | undefined;
  slideIndex: number;
  slideTitle?: string;
  lessonTitle?: string;
  cefrLevel?: string | null;
}) {
  return (
    <aside className="bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-orange-300 bg-orange-50/60">
        <h2 className="text-center text-[13px] font-bold uppercase tracking-widest text-orange-600">
          Teacher Notes
        </h2>
      </div>

      {/* Lesson title bar */}
      {lessonTitle && (
        <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
          <h3 className="text-white font-semibold text-[13px] leading-snug flex-1 truncate">
            {lessonTitle}
          </h3>
          {cefrLevel && (
            <span className="flex-shrink-0 bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase">
              {cefrLevel}
            </span>
          )}
        </div>
      )}

      {/* Slide indicator */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
        <p className="text-[11px] font-semibold text-slate-500">
          <span className="uppercase tracking-wide">Slide {slideIndex + 1}</span>
          {slideTitle && (
            <span className="text-slate-600 ml-1.5 font-medium">
              — {slideTitle}
            </span>
          )}
        </p>
      </div>

      {/* Notes content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {notes ? (
              <div className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                {notes}
              </div>
            ) : (
              <div className="text-center py-10">
                <FileText size={22} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No notes for this slide</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard hint */}
      <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono shadow-sm">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono shadow-sm">
            →
          </kbd>
          <span>Navigate slides</span>
        </p>
      </div>
    </aside>
  );
}
