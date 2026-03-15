"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import {
  Radio,
  BookOpen,
  Users,
  Search,
  Play,
  Zap,
  Filter,
  ArrowUpRight,
} from "lucide-react";

type LessonData = {
  id: string;
  title: string;
  description: string | null;
  contentType: string | null;
  category: string;
  cefrLevel: string | null;
  studentCount: number;
  completedCount: number;
  inProgressCount: number;
  activeSession: {
    id: string;
    status: string;
    startedAt: string;
  } | null;
};

export default function TeacherClassroomClient({
  userName,
  lessons,
  totalStudents,
  activeSessions,
}: {
  userName: string;
  lessons: LessonData[];
  totalStudents: number;
  activeSessions: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [cefrFilter, setCefrFilter] = useState<string | null>(null);

  const filtered = lessons.filter((l) => {
    if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    if (categoryFilter && l.category !== categoryFilter) return false;
    if (cefrFilter && l.cefrLevel !== cefrFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(lessons.map((l) => l.category)));
  const cefrLevels = Array.from(
    new Set(lessons.map((l) => l.cefrLevel).filter(Boolean))
  ) as string[];

  return (
    <DashboardLayout role="TEACHER" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Classroom</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Launch live sessions for your students
            </p>
          </div>
          {activeSessions > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              {activeSessions} active session{activeSessions !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {lessons.length}
              </p>
              <p className="text-xs text-slate-500">Total Lessons</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <Radio size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {activeSessions}
              </p>
              <p className="text-xs text-slate-500">Active Sessions</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {totalStudents}
              </p>
              <p className="text-xs text-slate-500">My Students</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              {categories.length > 1 && (
                <select
                  value={categoryFilter || ""}
                  onChange={(e) => setCategoryFilter(e.target.value || null)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => {
                    const config = getCategoryConfig(cat);
                    return (
                      <option key={cat} value={cat}>
                        {config.icon} {config.label}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              {cefrLevels.length > 0 && (
                <div className="flex gap-1">
                  {cefrLevels
                    .sort((a, b) => a.localeCompare(b))
                    .map((level) => {
                      const colors = cefrColors[level];
                      const isActive = cefrFilter === level;
                      return (
                        <button
                          key={level}
                          onClick={() =>
                            setCefrFilter(isActive ? null : level)
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            isActive
                              ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                </div>
              )}
              {(searchQuery || categoryFilter || cefrFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter(null);
                    setCefrFilter(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter info */}
        {(searchQuery || categoryFilter || cefrFilter) && (
          <p className="text-sm text-slate-500 mb-4">
            Showing {filtered.length} of {lessons.length} lessons
          </p>
        )}

        {/* Lesson Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {lessons.length === 0
                ? "No lessons available yet"
                : "No matching lessons"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {lessons.length === 0
                ? "Lessons will appear here once your students have assignments"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lesson) => {
              const cat = getCategoryConfig(lesson.category);
              const cefr = lesson.cefrLevel
                ? cefrColors[lesson.cefrLevel]
                : null;
              const hasActiveSession = lesson.activeSession !== null;
              const progressPct =
                lesson.studentCount > 0
                  ? Math.round(
                      (lesson.completedCount / lesson.studentCount) * 100
                    )
                  : 0;

              return (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
                    hasActiveSession
                      ? "border-green-200 ring-1 ring-green-100"
                      : "border-slate-200"
                  }`}
                >
                  {/* Card Header - colored strip */}
                  <div
                    className={`${cat.bg} px-5 py-3 border-b ${cat.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span
                          className={`text-xs font-semibold ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cefr && (
                          <span
                            className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-2 py-0.5 rounded-full`}
                          >
                            {lesson.cefrLevel}
                          </span>
                        )}
                        {hasActiveSession && (
                          <span className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                            </span>
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    )}

                    {/* Student progress mini-bar */}
                    <div className="mt-auto pt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">
                          {lesson.studentCount} student{lesson.studentCount !== 1 ? "s" : ""} assigned
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {progressPct}% complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {lesson.completedCount} done
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {lesson.inProgressCount} active
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {lesson.studentCount -
                            lesson.completedCount -
                            lesson.inProgressCount}{" "}
                          pending
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                    <Link
                      href={`/classroom/${lesson.id}`}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        hasActiveSession
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      }`}
                    >
                      {hasActiveSession ? (
                        <>
                          <Zap size={16} />
                          Resume Session
                          <ArrowUpRight size={14} />
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Launch Classroom
                          <ArrowUpRight size={14} />
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
