"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import {
  BookOpen,
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  lesson: { title: string; category: string; cefrLevel: string | null };
  student: { name: string; email: string };
};

type Lesson = {
  id: string;
  title: string;
  category: string;
  cefrLevel: string | null;
  _count: { assignments: number };
};

export default function AdminDashboard() {
  const [data, setData] = useState<{
    lessons: Lesson[];
    students: { id: string }[];
    teachers: { id: string }[];
    assignments: Assignment[];
    user: { name: string } | null;
  }>({
    lessons: [],
    students: [],
    teachers: [],
    assignments: [],
    user: null,
  });

  useEffect(() => {
    fetch("/admin/api")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const userName = data.user?.name || "Admin";
  const completedCount = data.assignments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const inProgressCount = data.assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const completionRate =
    data.assignments.length > 0
      ? Math.round((completedCount / data.assignments.length) * 100)
      : 0;

  // Group lessons by category for the mini chart
  const categoryBreakdown = data.lessons.reduce(
    (acc, l) => {
      const cat = getCategoryConfig(l.category);
      acc[l.category] = acc[l.category] || { label: cat.label, icon: cat.icon, count: 0 };
      acc[l.category].count++;
      return acc;
    },
    {} as Record<string, { label: string; icon: string; count: number }>
  );

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your learning management system
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            {
              icon: <BookOpen size={20} className="text-blue-600" />,
              label: "Lessons",
              value: data.lessons.length,
              bg: "bg-blue-50",
              href: "/admin/library",
            },
            {
              icon: <Users size={20} className="text-green-600" />,
              label: "Students",
              value: data.students.length,
              bg: "bg-green-50",
              href: "/admin/students",
            },
            {
              icon: <UserCheck size={20} className="text-purple-600" />,
              label: "Teachers",
              value: data.teachers.length,
              bg: "bg-purple-50",
              href: "/admin/teachers",
            },
            {
              icon: <ClipboardList size={20} className="text-orange-600" />,
              label: "Assignments",
              value: data.assignments.length,
              bg: "bg-orange-50",
              href: "/admin/students",
            },
            {
              icon: <TrendingUp size={20} className="text-emerald-600" />,
              label: "Completion",
              value: `${completionRate}%`,
              bg: "bg-emerald-50",
              href: "/admin/reports",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div
                className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Assignments */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Recent Assignments</h2>
              <Link
                href="/admin/students"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-6">
              {data.assignments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No assignments yet. Head to the Library to assign lessons.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {data.assignments.slice(0, 8).map((a) => {
                    const cat = getCategoryConfig(a.lesson.category);
                    const cefr = a.lesson.cefrLevel
                      ? cefrColors[a.lesson.cefrLevel]
                      : null;
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{cat.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {a.lesson.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {a.student.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {cefr && (
                            <span
                              className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
                            >
                              {a.lesson.cefrLevel}
                            </span>
                          )}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">By Category</h2>
              <Link
                href="/admin/library"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Library <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-6">
              {Object.keys(categoryBreakdown).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No lessons created yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown).map(([key, val]) => {
                    const cat = getCategoryConfig(key);
                    const maxCount = Math.max(
                      ...Object.values(categoryBreakdown).map((v) => v.count)
                    );
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600 flex items-center gap-2">
                            <span>{val.icon}</span>
                            {val.label}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {val.count}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${cat.bg.replace("50", "400")}`}
                            style={{
                              width: `${Math.round((val.count / maxCount) * 100)}%`,
                              backgroundColor:
                                key === "BUSINESS_ENGLISH"
                                  ? "#f87171"
                                  : key === "BEGINNERS"
                                  ? "#4ade80"
                                  : key === "GRAMMAR"
                                  ? "#a78bfa"
                                  : key === "CONVERSATION"
                                  ? "#fb923c"
                                  : key === "PRONUNCIATION"
                                  ? "#f472b6"
                                  : key === "VOCABULARY"
                                  ? "#2dd4bf"
                                  : key === "EXAM_PREP"
                                  ? "#fbbf24"
                                  : key === "YOUNG_LEARNERS"
                                  ? "#22d3ee"
                                  : "#60a5fa",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Status Summary */}
            <div className="px-6 py-4 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Assignment Status
              </h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Completed",
                    count: completedCount,
                    color: "bg-green-500",
                  },
                  {
                    label: "In Progress",
                    count: inProgressCount,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Not Started",
                    count:
                      data.assignments.length -
                      completedCount -
                      inProgressCount,
                    color: "bg-slate-300",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${s.color}`}
                      />
                      {s.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
