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
    "w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 transition-colors";

  return (
    /* ═══ 1. OUTER BACKDROP — dark grey, fills viewport ═══ */
    <div className="h-screen bg-[#404040] p-4 md:p-8 flex items-center justify-center overflow-hidden">

      {/* ═══ 2. MAIN APP CONTAINER — the "Box" ═══ */}
      <div className="flex flex-col w-full max-w-[1400px] h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl relative">

        {/* ═══ CONTENT: Left Sidebar + Right Stage ═══ */}
        <div className="flex flex-1 min-h-0">

          {/* ═══ 3. LEFT SIDEBAR — Teacher Notes ═══ */}
          <div className="flex flex-col w-[320px] flex-shrink-0 bg-[#F9FAFB] border-r border-gray-200">
            <TeacherNotesPanel
              notes={currentSlideData?.teacherNotes}
              slideIndex={currentSlide}
              slideTitle={currentSlideData?.title}
              lessonTitle={lesson.title}
              cefrLevel={lesson.cefrLevel}
              totalSlides={totalSlides}
              onPrev={prev}
              onNext={next}
              onFirst={() => goTo(0)}
              onLast={() => goTo(totalSlides - 1)}
              isFirst={isFirst}
              isLast={isLast}
            />
          </div>

          {/* ═══ 4. RIGHT AREA — Slide Stage ═══ */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F3F4F6]">

            {/* Top toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 h-10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/classroom/${lessonId}/canvas`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeTab === "canvas" ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab("canvas")}
                >
                  <Image size={14} />
                  Canvas
                </Link>
                <button
                  onClick={() => setActiveTab("homework")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeTab === "homework" ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <ListChecks size={14} />
                  Homework
                </button>

                {sessionStatus === "ACTIVE" && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 ml-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
                {sessionStatus === "PAUSED" && (
                  <button onClick={handleResume} className="text-[10px] font-semibold text-amber-600 ml-2 hover:underline">
                    Paused — Resume
                  </button>
                )}
                {!isConnected && (
                  <span className="text-[10px] text-red-400 ml-2 animate-pulse">Reconnecting...</span>
                )}
              </div>

              <div className="flex items-center gap-0.5">
                <button className={toolBtn} title="Text"><Type size={15} /></button>
                <button className={toolBtn} title="Draw"><PenTool size={15} /></button>
                <button className={toolBtn} title="Search"><Search size={15} /></button>
                <button className={toolBtn} title="Fullscreen"><Maximize2 size={15} /></button>
                {sessionStatus === "ACTIVE" && (
                  <button onClick={handlePause} className="ml-2 text-[10px] font-medium text-gray-400 hover:text-gray-600">Pause</button>
                )}
              </div>
            </div>

            {/* Slide display — centered with padding, 16:9 aspect ratio */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-8">
              <div className="w-full max-w-[850px] aspect-video rounded-lg overflow-hidden shadow-lg">
                <SlideRenderer
                  slide={currentSlideData}
                  slideIndex={currentSlide}
                  direction={direction}
                />
              </div>
            </div>

            {/* Bottom slide nav */}
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

        {/* ═══ 5. ACTION BUTTONS — fixed at bottom of the 1400px box ═══ */}
        <div className="flex w-full flex-shrink-0 h-14">
          <button className="flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#F97316] text-white hover:brightness-110 transition-all">
            Enroll Students
          </button>
          <button className="flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#EAB308] text-gray-800 hover:brightness-110 transition-all">
            Take Notes
          </button>
          <button className="flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#84CC16] text-white hover:brightness-110 transition-all">
            Give Us Feedback
          </button>
          <button
            onClick={handleEnd}
            className="flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#A855F7] text-white hover:brightness-110 transition-all"
          >
            Close Classroom
          </button>
        </div>
      </div>

      {/* Chat — outside the box, floating */}
      <ClassroomChat
        lessonId={lessonId}
        userName={userName}
        userRole="TEACHER"
      />
    </div>
  );
}
