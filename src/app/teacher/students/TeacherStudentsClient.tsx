"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import {
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Clock,
  AlertCircle,
  Radio,
} from "lucide-react";

type AssignmentData = {
  id: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
  lesson: {
    id: string;
    title: string;
    contentType: string | null;
    category: string;
    cefrLevel: string | null;
  };
};

type StudentData = {
  id: string;
  name: string;
  email: string;
  linkedAt: string;
  assignments: AssignmentData[];
};

export default function TeacherStudentsClient({
  userName,
  students,
}: {
  userName: string;
  students: StudentData[];
}) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(
    students[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const totalAssignments = students.reduce(
    (sum, s) => sum + s.assignments.length,
    0
  );
  const completedAssignments = students.reduce(
    (sum, s) =>
      sum + s.assignments.filter((a) => a.status === "COMPLETED").length,
    0
  );
  const completionRate =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  const filteredStudents = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((s) => {
      if (statusFilter === "has_assignments") return s.assignments.length > 0;
      if (statusFilter === "no_assignments") return s.assignments.length === 0;
      if (statusFilter === "all_completed")
        return (
          s.assignments.length > 0 &&
          s.assignments.every((a) => a.status === "COMPLETED")
        );
      return true;
    });

  return (
    <DashboardLayout role="TEACHER" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">My Students</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {students.length} student{students.length !== 1 ? "s" : ""} linked to
          you
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {students.length}
              </p>
              <p className="text-xs text-slate-500">My Students</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <ClipboardList size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {totalAssignments}
              </p>
              <p className="text-xs text-slate-500">Total Assignments</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {completedAssignments}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {completionRate}%
              </p>
              <p className="text-xs text-slate-500">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: null, label: "All Students" },
                { key: "has_assignments", label: "With Lessons" },
                { key: "no_assignments", label: "No Lessons" },
                { key: "all_completed", label: "All Complete" },
              ].map((f) => (
                <button
                  key={f.key || "all"}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === f.key
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Cards */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {students.length === 0
                ? "No students linked yet"
                : "No matching students"}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {students.length === 0
                ? "The administrator will link students to you"
                : "Try a different search or filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const completed = student.assignments.filter(
                (a) => a.status === "COMPLETED"
              ).length;
              const inProgress = student.assignments.filter(
                (a) => a.status === "IN_PROGRESS"
              ).length;
              const notStarted = student.assignments.filter(
                (a) => a.status === "NOT_STARTED"
              ).length;
              const total = student.assignments.length;
              const isExpanded = expandedStudent === student.id;
              const pct =
                total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Student Header Row */}
                  <button
                    onClick={() =>
                      setExpandedStudent(isExpanded ? null : student.id)
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Mail size={12} /> {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Status dots */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-slate-600 font-medium">
                            {completed}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-slate-600 font-medium">
                            {inProgress}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                          <span className="text-slate-600 font-medium">
                            {notStarted}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-28">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {pct}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {completed}/{total}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp size={18} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Assignment Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {student.assignments.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <AlertCircle
                            size={24}
                            className="mx-auto text-slate-300 mb-2"
                          />
                          <p className="text-sm text-slate-400">
                            No lessons assigned to this student yet.
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            Ask your administrator to assign lessons.
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                              <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                Lesson
                              </th>
                              <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                Category
                              </th>
                              <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                CEFR
                              </th>
                              <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                Status
                              </th>
                              <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                Assigned
                              </th>
                              <th className="text-right py-2.5 px-5 font-semibold text-slate-400 text-xs">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {student.assignments.map((a) => {
                              const cat = getCategoryConfig(a.lesson.category);
                              const cefr = a.lesson.cefrLevel
                                ? cefrColors[a.lesson.cefrLevel]
                                : null;
                              return (
                                <tr
                                  key={a.id}
                                  className="border-b border-slate-50 hover:bg-slate-50/50"
                                >
                                  <td className="py-2.5 px-5">
                                    <div className="flex items-center gap-2">
                                      <span>{cat.icon}</span>
                                      <span className="font-medium text-slate-700">
                                        {a.lesson.title}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-5">
                                    <span
                                      className={`${cat.bg} ${cat.color} text-xs font-medium px-2 py-0.5 rounded-full`}
                                    >
                                      {cat.label}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-5">
                                    {cefr ? (
                                      <span
                                        className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
                                      >
                                        {a.lesson.cefrLevel}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-5">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                        a.status === "COMPLETED"
                                          ? "bg-green-100 text-green-700"
                                          : a.status === "IN_PROGRESS"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {a.status.replace("_", " ")}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-5 text-slate-400 text-xs">
                                    {new Date(
                                      a.assignedAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-2.5 px-5 text-right">
                                    <Link
                                      href={`/classroom/${a.lesson.id}`}
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                      <Radio size={12} />
                                      Teach
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {/* Student summary footer */}
                      {student.assignments.length > 0 && (
                        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Linked{" "}
                              {new Date(student.linkedAt).toLocaleDateString()}
                            </span>
                            <span>
                              {student.assignments.length} lesson{student.assignments.length !== 1 ? "s" : ""} assigned
                            </span>
                          </div>
                          {completed === total && total > 0 && (
                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              All lessons completed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
