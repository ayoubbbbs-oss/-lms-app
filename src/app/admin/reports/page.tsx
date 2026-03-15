"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig } from "@/lib/lessonHelpers";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  lesson: { title: string; category: string; cefrLevel: string | null };
  student: { name: string; email: string };
};

type Student = {
  id: string;
  name: string;
  studentAssignments: { status: string }[];
};

type Lesson = {
  id: string;
  title: string;
  category: string;
  cefrLevel: string | null;
  _count: { assignments: number };
};

export default function ReportsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/admin/api")
      .then((r) => r.json())
      .then((data) => {
        setAssignments(data.assignments);
        setStudents(data.students);
        setLessons(data.lessons);
        setUserName(data.user?.name || "Admin");
      });
  }, []);

  const totalAssignments = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter((a) => a.status === "IN_PROGRESS").length;
  const notStarted = assignments.filter((a) => a.status === "NOT_STARTED").length;
  const completionRate = totalAssignments > 0 ? Math.round((completed / totalAssignments) * 100) : 0;

  // ── Status Bar Chart data ──
  const statusBarData = [
    { name: "Completed", value: completed, fill: "#22c55e" },
    { name: "In Progress", value: inProgress, fill: "#f59e0b" },
    { name: "Not Started", value: notStarted, fill: "#cbd5e1" },
  ];

  // ── Pie chart data ──
  const statusPieData = statusBarData.filter((d) => d.value > 0);

  // ── Category breakdown chart ──
  const categoryData = Object.entries(
    assignments.reduce(
      (acc, a) => {
        const cat = a.lesson.category;
        if (!acc[cat]) acc[cat] = { completed: 0, inProgress: 0, notStarted: 0 };
        if (a.status === "COMPLETED") acc[cat].completed++;
        else if (a.status === "IN_PROGRESS") acc[cat].inProgress++;
        else acc[cat].notStarted++;
        return acc;
      },
      {} as Record<string, { completed: number; inProgress: number; notStarted: number }>
    )
  ).map(([key, val]) => ({
    name: getCategoryConfig(key).label,
    icon: getCategoryConfig(key).icon,
    Completed: val.completed,
    "In Progress": val.inProgress,
    "Not Started": val.notStarted,
  }));

  // ── CEFR breakdown ──
  const cefrData = Object.entries(
    assignments.reduce(
      (acc, a) => {
        const level = a.lesson.cefrLevel || "Unset";
        if (!acc[level]) acc[level] = { completed: 0, inProgress: 0, notStarted: 0 };
        if (a.status === "COMPLETED") acc[level].completed++;
        else if (a.status === "IN_PROGRESS") acc[level].inProgress++;
        else acc[level].notStarted++;
        return acc;
      },
      {} as Record<string, { completed: number; inProgress: number; notStarted: number }>
    )
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      name: key,
      Completed: val.completed,
      "In Progress": val.inProgress,
      "Not Started": val.notStarted,
    }));

  // ── Top students ──
  const topStudents = [...students]
    .map((s) => ({
      name: s.name,
      completed: s.studentAssignments.filter((a) => a.status === "COMPLETED").length,
      total: s.studentAssignments.length,
      rate:
        s.studentAssignments.length > 0
          ? Math.round(
              (s.studentAssignments.filter((a) => a.status === "COMPLETED").length /
                s.studentAssignments.length) *
                100
            )
          : 0,
    }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8);

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track learning progress and engagement across your organization
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { icon: <BarChart3 size={20} className="text-blue-600" />, label: "Assignments", value: totalAssignments, bg: "bg-blue-50" },
            { icon: <CheckCircle2 size={20} className="text-green-600" />, label: "Completed", value: completed, bg: "bg-green-50" },
            { icon: <Clock size={20} className="text-amber-600" />, label: "In Progress", value: inProgress, bg: "bg-amber-50" },
            { icon: <AlertCircle size={20} className="text-slate-500" />, label: "Not Started", value: notStarted, bg: "bg-slate-50" },
            { icon: <TrendingUp size={20} className="text-emerald-600" />, label: "Completion Rate", value: `${completionRate}%`, bg: "bg-emerald-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Status Overview Bar Chart */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-1">Assignment Status Overview</h2>
            <p className="text-sm text-slate-400 mb-6">Completed vs In Progress vs Not Started</p>
            {totalAssignments === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                No assignment data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusBarData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Pie */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-1">Distribution</h2>
            <p className="text-sm text-slate-400 mb-4">Assignment breakdown</p>
            {totalAssignments === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* By Category */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-1">Progress by Category</h2>
            <p className="text-sm text-slate-400 mb-6">Stacked breakdown per lesson category</p>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} angle={-20} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Completed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="In Progress" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Not Started" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By CEFR Level */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-1">Progress by CEFR Level</h2>
            <p className="text-sm text-slate-400 mb-6">How students perform at each proficiency level</p>
            {cefrData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cefrData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Completed" stackId="a" fill="#22c55e" />
                  <Bar dataKey="In Progress" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Not Started" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Student Leaderboard</h2>
          <p className="text-sm text-slate-400 mb-6">Top performing students by completion rate</p>
          {topStudents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No student progress data available yet
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {topStudents.map((student, i) => (
                <div
                  key={student.name}
                  className={`relative p-4 rounded-2xl border ${
                    i === 0
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                      : i === 1
                      ? "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200"
                      : i === 2
                      ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {i < 3 && (
                    <div className="absolute top-3 right-3 text-lg">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </div>
                  )}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3 shadow-sm">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {student.completed}/{student.total} lessons
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-600">{student.rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-500" : i === 2 ? "bg-orange-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${student.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
