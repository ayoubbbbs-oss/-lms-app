"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors, cefrLevels } from "@/lib/lessonHelpers";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  ListChecks,
  CircleDot,
} from "lucide-react";

type Stats = {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercentage: number;
};

type Assignment = {
  id: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
  lesson: {
    id: string;
    title: string;
    category: string;
    cefrLevel: string | null;
  };
};

type CefrBreakdown = Record<string, { total: number; completed: number }>;
type CategoryBreakdown = Record<
  string,
  { total: number; completed: number; inProgress: number }
>;

export default function StudentProgressClient({
  userName,
  stats,
  cefrBreakdown,
  categoryBreakdown,
  assignments,
}: {
  userName: string;
  stats: Stats;
  cefrBreakdown: CefrBreakdown;
  categoryBreakdown: CategoryBreakdown;
  assignments: Assignment[];
}) {
  const cefrOrder = [...cefrLevels, "Unset"];

  const sortedCefr = cefrOrder.filter((level) => cefrBreakdown[level]);

  const sortedCategories = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b.total - a.total
  );

  return (
    <DashboardLayout role="STUDENT" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">My Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track your learning journey and lesson completion
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Lessons</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.completionPercentage}%
              </p>
              <p className="text-xs text-slate-500">Completion</p>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Overall Progress
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {stats.completed} of {stats.total} lessons completed
            </span>
          </div>
          <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${stats.completionPercentage}%`,
                background:
                  stats.completionPercentage === 100
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : "linear-gradient(90deg, #3b82f6, #6366f1)",
              }}
            />
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              Completed ({stats.completed})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              In Progress ({stats.inProgress})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
              Not Started ({stats.notStarted})
            </div>
          </div>
        </div>

        {/* CEFR & Category Breakdown Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* CEFR Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                CEFR Levels
              </h2>
            </div>
            {sortedCefr.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No assignments yet
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCefr.map((level) => {
                  const data = cefrBreakdown[level];
                  const pct =
                    data.total > 0
                      ? Math.round((data.completed / data.total) * 100)
                      : 0;
                  const colors =
                    cefrColors[level] || { bg: "bg-slate-100", text: "text-slate-600" };
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}
                        >
                          {level}
                        </span>
                        <span className="text-xs text-slate-500">
                          {data.completed}/{data.total} completed
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CircleDot size={18} className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Categories
              </h2>
            </div>
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No assignments yet
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(([category, data]) => {
                  const config = getCategoryConfig(category);
                  const pct =
                    data.total > 0
                      ? Math.round((data.completed / data.total) * 100)
                      : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {data.completed}/{data.total} completed
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Assignment List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                All Assignments
              </h2>
              <span className="ml-auto text-xs text-slate-400 font-medium">
                {assignments.length} total
              </span>
            </div>
          </div>
          {assignments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                No assignments yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Your administrator will assign lessons to you
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Lesson
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      CEFR
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Assigned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => {
                    const catConfig = getCategoryConfig(a.lesson.category);
                    const cefrColor = a.lesson.cefrLevel
                      ? cefrColors[a.lesson.cefrLevel] || {
                          bg: "bg-slate-100",
                          text: "text-slate-600",
                        }
                      : null;

                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-medium text-slate-800">
                            {a.lesson.title}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${catConfig.bg} ${catConfig.color} border ${catConfig.border}`}
                          >
                            {catConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          {cefrColor ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cefrColor.bg} ${cefrColor.text}`}
                            >
                              {a.lesson.cefrLevel}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              a.status === "COMPLETED"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : a.status === "IN_PROGRESS"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {a.status === "COMPLETED" && (
                              <CheckCircle2 size={12} className="mr-1" />
                            )}
                            {a.status === "IN_PROGRESS" && (
                              <Clock size={12} className="mr-1" />
                            )}
                            {a.status === "NOT_STARTED"
                              ? "Not Started"
                              : a.status === "IN_PROGRESS"
                              ? "In Progress"
                              : "Completed"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-slate-500">
                            {new Date(a.assignedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
