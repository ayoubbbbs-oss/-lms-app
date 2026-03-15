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
    "w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors";

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* ═══ MAIN CONTENT — Left Notes + Right Slide ═══ */}
      <div className="flex flex-1 min-h-0">
        {/* ═══ LEFT COLUMN — Teacher Notes ═══ */}
        <div className="flex flex-col w-[300px] flex-shrink-0 border-r border-gray-200">
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

        {/* ═══ RIGHT COLUMN — Toolbar + Slide + Nav ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top toolbar — matches Off2Class: Canvas | Homework | audio | icons */}
          <div className="bg-white border-b border-gray-200 px-4 h-10 flex items-center justify-between flex-shrink-0">
            {/* Left: Tabs */}
            <div className="flex items-center gap-2">
              <Link
                href={`/classroom/${lessonId}/canvas`}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === "canvas"
                    ? "text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab("canvas")}
              >
                <Image size={14} />
                Canvas
              </Link>
              <button
                onClick={() => setActiveTab("homework")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeTab === "homework"
                    ? "text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <ListChecks size={14} />
                Homework
              </button>

              {/* Session status */}
              {sessionStatus === "ACTIVE" && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 ml-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
              {sessionStatus === "PAUSED" && (
                <button
                  onClick={handleResume}
                  className="text-[10px] font-semibold text-amber-600 ml-2 hover:underline"
                >
                  Paused — Resume
                </button>
              )}
              {!isConnected && (
                <span className="text-[10px] text-red-400 ml-2 animate-pulse">
                  Reconnecting...
                </span>
              )}
            </div>

            {/* Right: Utility icons — matches Off2Class: A, pen, search, expand */}
            <div className="flex items-center gap-0.5">
              <button className={toolBtn} title="Text">
                <Type size={15} />
              </button>
              <button className={toolBtn} title="Draw">
                <PenTool size={15} />
              </button>
              <button className={toolBtn} title="Search">
                <Search size={15} />
              </button>
              <button className={toolBtn} title="Fullscreen">
                <Maximize2 size={15} />
              </button>

              {sessionStatus !== "ENDED" && sessionStatus === "ACTIVE" && (
                <button
                  onClick={handlePause}
                  className="ml-2 text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Pause
                </button>
              )}
            </div>
          </div>

          {/* Slide stage — white bg, slide fills the space */}
          <div className="flex-1 min-h-0 bg-gray-50">
            <SlideRenderer
              slide={currentSlideData}
              slideIndex={currentSlide}
              direction={direction}
            />
          </div>

          {/* Bottom nav — right side only, gray circles centered */}
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

      {/* ═══ BOTTOM ACTION BAR — 4 buttons in a row, full width ═══ */}
      <div className="flex flex-shrink-0">
        <button className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#e8740c] text-white hover:bg-[#d06500] transition-colors">
          Enroll Students
        </button>
        <button className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#f5c518] text-gray-800 hover:bg-[#e0b200] transition-colors">
          Take Notes
        </button>
        <button className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#7cb342] text-white hover:bg-[#689f38] transition-colors">
          Give Us Feedback
        </button>
        <button
          onClick={handleEnd}
          className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-[#7b1fa2] text-white hover:bg-[#6a1b9a] transition-colors"
        >
          Close Classroom
        </button>
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
