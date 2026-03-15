"use client";

import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import { ArrowLeft, FileText, Video, Globe, BookOpen } from "lucide-react";
import Link from "next/link";

type LessonData = {
  id: string;
  title: string;
  description: string | null;
  contentUrl: string | null;
  contentType: string | null;
  category: string;
  cefrLevel: string | null;
  teacherNotes: string | null;
};

export default function LessonViewer({
  lesson,
  showTeacherNotes,
  backUrl,
  role,
  userName,
}: {
  lesson: LessonData;
  showTeacherNotes: boolean;
  backUrl: string;
  role: string;
  userName: string;
}) {
  const cat = getCategoryConfig(lesson.category);
  const cefr = lesson.cefrLevel ? cefrColors[lesson.cefrLevel] : null;

  const contentIcon = {
    pdf: <FileText size={20} />,
    video: <Video size={20} />,
    interactive: <Globe size={20} />,
    document: <BookOpen size={20} />,
  }[lesson.contentType || ""] || <BookOpen size={20} />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat.icon}</span>
            <h1 className="font-bold text-slate-800">{lesson.title}</h1>
            {cefr && (
              <span
                className={`${cefr.bg} ${cefr.text} text-xs font-bold px-2 py-0.5 rounded-full`}
              >
                {lesson.cefrLevel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className={`${cat.bg} ${cat.color} px-2.5 py-1 rounded-full text-xs font-medium`}>
            {cat.label}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Teacher Notes Panel (Left) */}
        {showTeacherNotes && (
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <FileText size={15} className="text-amber-500" />
                Teacher Notes
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {lesson.teacherNotes ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                    {lesson.teacherNotes}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">
                    No teacher notes for this lesson.
                  </p>
                </div>
              )}

              {/* Lesson Info */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Lesson Details
                </h3>
                {lesson.description && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-700">
                      {lesson.description}
                    </p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Content Type
                  </p>
                  <p className="text-sm text-slate-700 capitalize flex items-center gap-1.5">
                    {contentIcon}
                    {lesson.contentType || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area (Right) */}
        <div className="flex-1 overflow-y-auto">
          {lesson.contentUrl ? (
            <div className="h-full">
              {lesson.contentType === "video" ? (
                <div className="flex items-center justify-center h-full bg-black">
                  <video
                    src={lesson.contentUrl}
                    controls
                    className="max-w-full max-h-full"
                  />
                </div>
              ) : lesson.contentType === "pdf" ? (
                <iframe
                  src={lesson.contentUrl}
                  className="w-full h-full border-0"
                  title={lesson.title}
                />
              ) : (
                <iframe
                  src={lesson.contentUrl}
                  className="w-full h-full border-0"
                  title={lesson.title}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div
                  className={`w-20 h-20 ${cat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-4xl">{cat.icon}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">
                  {lesson.title}
                </h2>
                {lesson.description && (
                  <p className="text-slate-500 max-w-md mx-auto mb-4">
                    {lesson.description}
                  </p>
                )}
                <p className="text-sm text-slate-400">
                  No content URL has been set for this lesson yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
