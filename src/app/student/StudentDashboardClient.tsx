"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LessonCard from "@/components/LessonCard";
import CefrFilter from "@/components/CefrFilter";
import { getCategoryConfig } from "@/lib/lessonHelpers";
import { BookOpen, Clock, CheckCircle2, Search } from "lucide-react";

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  lesson: {
    id: string;
    title: string;
    description: string | null;
    contentUrl: string | null;
    contentType: string | null;
    category: string;
    cefrLevel: string | null;
  };
};

export default function StudentDashboardClient({
  userName,
  assignments,
}: {
  userName: string;
  assignments: Assignment[];
}) {
  const [cefrFilter, setCefrFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = assignments.filter((a) => {
    if (cefrFilter && a.lesson.cefrLevel !== cefrFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (
      searchQuery &&
      !a.lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const completedCount = assignments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const inProgressCount = assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const notStartedCount = assignments.filter(
    (a) => a.status === "NOT_STARTED"
  ).length;

  return (
    <DashboardLayout role="STUDENT" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">My Lessons</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Lessons assigned to you by your administrator
        </p>
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
                {assignments.length}
              </p>
              <p className="text-xs text-slate-500">Total Lessons</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {inProgressCount}
              </p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {completedCount}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search my lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <CefrFilter selected={cefrFilter} onChange={setCefrFilter} />
            <div className="flex gap-1">
              {[
                { key: null, label: "All" },
                { key: "NOT_STARTED", label: "Not Started" },
                { key: "IN_PROGRESS", label: "In Progress" },
                { key: "COMPLETED", label: "Completed" },
              ].map((s) => (
                <button
                  key={s.key || "all"}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === s.key
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {assignments.length === 0
                ? "No lessons assigned yet"
                : "No matching lessons"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {assignments.length === 0
                ? "Your administrator will assign lessons to you"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((assignment) => (
              <div key={assignment.id} className="relative">
                {/* Status indicator */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      assignment.status === "COMPLETED"
                        ? "bg-green-500 text-white"
                        : assignment.status === "IN_PROGRESS"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {assignment.status.replace("_", " ")}
                  </span>
                </div>
                <LessonCard
                  id={assignment.lesson.id}
                  title={assignment.lesson.title}
                  description={assignment.lesson.description}
                  category={assignment.lesson.category}
                  cefrLevel={assignment.lesson.cefrLevel}
                  contentType={assignment.lesson.contentType}
                  showActions={["launch"]}
                  onLaunch={(id) =>
                    window.open(`/student/lessons/${id}`, "_blank")
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
