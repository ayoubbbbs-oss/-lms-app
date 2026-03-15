"use client";

import { useCallback, useState } from "react";
import { useClassroomChannel } from "@/lib/classroom/useClassroomChannel";
import { useSlideNavigation } from "@/lib/classroom/useSlideNavigation";
import { updateSessionSlide, updateSessionStatus } from "../actions";
import type { Slide } from "@/lib/classroom/types";
import SlideRenderer from "@/components/classroom/SlideRenderer";
import SlideControls from "@/components/classroom/SlideControls";
import TeacherNotesPanel from "@/components/classroom/TeacherNotesPanel";
import ClassroomChat from "@/components/classroom/ClassroomChat";
import Link from "next/link";
import {
  Image,
  ListChecks,
  Type,
  PenTool,
  Search,
  Maximize2,
  Users,
  StickyNote,
  MessageSquare,
  LogOut,
} from "lucide-react";

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

export default function ClassroomTeacher({
  sessionId,
  lessonId,
  slides,
  initialSlide,
  lesson,
  backUrl,
  userName,
}: Props) {
  const [sessionStatus, setSessionStatus] = useState<string>("ACTIVE");
  const [activeTab, setActiveTab] = useState<"canvas" | "homework">("canvas");

  // ── Real-time logic (UNTOUCHED) ──
  const { broadcastSlideChange, broadcastStatus, isConnected } =
    useClassroomChannel({
      sessionId,
      role: "TEACHER",
      onSlideChange: () => {},
      onStatusChange: (status) => setSessionStatus(status),
    });

  const persistSlide = useCallback(
    (slideIndex: number) => {
      updateSessionSlide(sessionId, slideIndex);
    },
    [sessionId]
  );

  const {
    currentSlide,
    direction,
    next,
    prev,
    goTo,
    isFirst,
    isLast,
    totalSlides,
  } = useSlideNavigation({
    totalSlides: slides.length,
    initialSlide,
    onSlideChange: broadcastSlideChange,
    onPersist: persistSlide,
    enabled: sessionStatus !== "ENDED",
  });

  const currentSlideData = slides[currentSlide] || slides[0];

  async function handlePause() {
    setSessionStatus("PAUSED");
    broadcastStatus("PAUSED");
    await updateSessionStatus(sessionId, "PAUSED");
  }

  async function handleResume() {
    setSessionStatus("ACTIVE");
    broadcastStatus("ACTIVE");
    await updateSessionStatus(sessionId, "ACTIVE");
  }

  async function handleEnd() {
    if (!confirm("End this classroom session?")) return;
    setSessionStatus("ENDED");
    broadcastStatus("ENDED");
    await updateSessionStatus(sessionId, "ENDED");
  }
  // ── End real-time logic ──

  const toolBtn =
    "w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400";

  return (
    <div className="h-screen bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
      {/* ═══ CENTERED BOX ═══ */}
      <div className="w-full max-w-[1300px] h-[92vh] flex rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col w-[300px] flex-shrink-0 bg-white">
          <TeacherNotesPanel
            notes={currentSlideData?.teacherNotes}
            slideIndex={currentSlide}
            slideTitle={currentSlideData?.title}
            lessonTitle={lesson.title}
            cefrLevel={lesson.cefrLevel}
          />

          {/* Action buttons — 2x2 compact pad */}
          <div className="border-t border-slate-200 bg-slate-50 grid grid-cols-2 flex-shrink-0">
            <button className="h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-orange-500 text-white hover:bg-orange-600 transition-colors">
              <Users size={13} />
              Enroll
            </button>
            <button className="h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors">
              <StickyNote size={13} />
              Notes
            </button>
            <button className="h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-lime-500 text-white hover:bg-lime-600 transition-colors">
              <MessageSquare size={13} />
              Feedback
            </button>
            <button
              onClick={handleEnd}
              className="h-10 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-violet-500 text-white hover:bg-violet-600 transition-colors"
            >
              <LogOut size={13} />
              Close
            </button>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Top toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 h-12 flex items-center justify-between flex-shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1">
              <Link
                href={`/classroom/${lessonId}/canvas`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "canvas"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("canvas")}
              >
                <Image size={15} />
                Canvas
              </Link>
              <button
                onClick={() => setActiveTab("homework")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "homework"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <ListChecks size={15} />
                Homework
              </button>

              {/* Session status */}
              <div className="ml-3 flex items-center gap-2">
                {sessionStatus === "ACTIVE" && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
                {sessionStatus === "PAUSED" && (
                  <button
                    onClick={handleResume}
                    className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Paused — Resume
                  </button>
                )}
                {!isConnected && (
                  <span className="text-xs text-red-400 animate-pulse">
                    Reconnecting...
                  </span>
                )}
              </div>
            </div>

            {/* Right tools */}
            <div className="flex items-center gap-0.5">
              <button className={toolBtn} title="Text tool">
                <Type size={16} />
              </button>
              <button className={toolBtn} title="Pen tool">
                <PenTool size={16} />
              </button>
              <button className={toolBtn} title="Search">
                <Search size={16} />
              </button>
              <button className={toolBtn} title="Fullscreen">
                <Maximize2 size={16} />
              </button>

              {sessionStatus !== "ENDED" && sessionStatus === "ACTIVE" && (
                <button
                  onClick={handlePause}
                  className="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  Pause
                </button>
              )}
            </div>
          </div>

          {/* Slide stage */}
          <div className="flex-1 min-h-0 bg-[#e5e7eb]">
            <SlideRenderer
              slide={currentSlideData}
              slideIndex={currentSlide}
              direction={direction}
            />
          </div>

          {/* Bottom nav */}
          <SlideControls
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            onPrev={prev}
            onNext={next}
            isFirst={isFirst}
            isLast={isLast}
            disabled={sessionStatus === "ENDED"}
            onFirst={() => goTo(0)}
            onLast={() => goTo(totalSlides - 1)}
          />
        </div>
      </div>

      {/* Chat */}
      <ClassroomChat
        lessonId={lessonId}
        userName={userName}
        userRole="TEACHER"
      />
    </div>
  );
}
