"use client";

import { useCallback, useState } from "react";
import { useClassroomChannel } from "@/lib/classroom/useClassroomChannel";
import { useSlideNavigation } from "@/lib/classroom/useSlideNavigation";
import type { Slide } from "@/lib/classroom/types";
import SlideRenderer from "@/components/classroom/SlideRenderer";
import ClassroomChat from "@/components/classroom/ClassroomChat";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Pause, Square, Wifi, WifiOff } from "lucide-react";

type Props = {
  sessionId: string;
  lessonId: string;
  slides: Slide[];
  initialSlide: number;
  lesson: {
    title: string;
    category: string;
    cefrLevel: string | null;
  };
  backUrl: string;
  userName: string;
};

export default function ClassroomStudent({
  sessionId,
  lessonId,
  slides,
  initialSlide,
  lesson,
  backUrl,
  userName,
}: Props) {
  const [sessionStatus, setSessionStatus] = useState<string>("ACTIVE");

  // ── Real-time logic (UNTOUCHED) ──
  const { setSlideFromExternal, currentSlide, direction, totalSlides } =
    useSlideNavigation({
      totalSlides: slides.length,
      initialSlide,
      onSlideChange: () => {},
      enabled: false,
    });

  const handleSlideChange = useCallback(
    (index: number) => {
      setSlideFromExternal(index);
    },
    [setSlideFromExternal]
  );

  const { isConnected } = useClassroomChannel({
    sessionId,
    role: "STUDENT",
    onSlideChange: handleSlideChange,
    onStatusChange: (status) => setSessionStatus(status),
  });
  // ── End real-time logic ──

  return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1000px] h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-50">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-5 h-11 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-slate-800">
              {lesson.title}
            </h1>
            {lesson.cefrLevel && (
              <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase">
                {lesson.cefrLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi size={14} className="text-emerald-500" />
            ) : (
              <WifiOff size={14} className="text-red-400 animate-pulse" />
            )}
            {sessionStatus === "ACTIVE" && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Slide */}
        <div className="flex-1 min-h-0 bg-[#e5e7eb] relative">
          <SlideRenderer
            slide={slides[currentSlide] || slides[0]}
            slideIndex={currentSlide}
            direction={direction}
          />

          {/* Overlays */}
          <AnimatePresence>
            {sessionStatus === "PAUSED" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30"
              >
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pause size={24} className="text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    Session Paused
                  </h2>
                  <p className="text-sm text-slate-500">
                    Your teacher has paused the lesson.
                  </p>
                </div>
              </motion.div>
            )}

            {sessionStatus === "ENDED" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30"
              >
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-xs">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Square size={24} className="text-slate-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    Session Ended
                  </h2>
                  <p className="text-sm text-slate-500 mb-4">
                    This classroom session has been completed.
                  </p>
                  <a
                    href={backUrl}
                    className="inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Return to Dashboard
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-center py-2 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-5 bg-sky-500"
                      : i < currentSlide
                      ? "w-1.5 bg-sky-300"
                      : "w-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Monitor size={11} />
              Teacher-controlled
            </span>
          </div>
        </div>
      </div>

      <ClassroomChat
        lessonId={lessonId}
        userName={userName}
        userRole="STUDENT"
      />
    </div>
  );
}
