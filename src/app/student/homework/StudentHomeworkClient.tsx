"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

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

export default function StudentHomeworkClient({
  userName,
  assignments,
}: {
  userName: string;
  assignments: Assignment[];
}) {
  const [tab, setTab] = useState<"pending" | "completed">("pending");

  const pending = assignments.filter((a) => a.status !== "COMPLETED");
  const completed = assignments.filter((a) => a.status === "COMPLETED");
  const inProgress = assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const notStarted = assignments.filter(
    (a) => a.status === "NOT_STARTED"
  ).length;

  const active = tab === "pending" ? pending : completed;

  return (
    <DashboardLayout role="STUDENT" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">My Homework</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track and complete your assigned lessons
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: <ClipboardList size={18} className="text-blue-600" />,
              label: "Total",
              value: assignments.length,
              bg: "bg-blue-50",
            },
            {
              icon: <AlertCircle size={18} className="text-slate-500" />,
              label: "Not Started",
              value: notStarted,
              bg: "bg-slate-50",
            },
            {
              icon: <Clock size={18} className="text-amber-600" />,
              label: "In Progress",
              value: inProgress,
              bg: "bg-amber-50",
            },
            {
              icon: <CheckCircle2 size={18} className="text-green-600" />,
              label: "Completed",
              value: completed.length,
              bg: "bg-green-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "pending"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "completed"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Completed ({completed.length})
          </button>
        </div>

        {/* Table */}
        {active.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            {tab === "pending" ? (
              <>
                <CheckCircle2
                  size={40}
                  className="mx-auto text-green-300 mb-2"
                />
                <p className="text-sm text-slate-500 font-medium">
                  All caught up!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No pending homework right now
                </p>
              </>
            ) : (
              <>
                <ClipboardList
                  size={40}
                  className="mx-auto text-slate-300 mb-2"
                />
                <p className="text-sm text-slate-500 font-medium">
                  No completed homework yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Completed lessons will appear here
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Lesson
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Category
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    CEFR
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Status
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    {tab === "completed" ? "Completed" : "Assigned"}
                  </th>
                  <th className="text-right py-2.5 px-4 font-semibold text-slate-400 text-xs" />
                </tr>
              </thead>
              <tbody>
                {active.map((a) => {
                  const cat = getCategoryConfig(a.lesson.category);
                  const cefr = a.lesson.cefrLevel
                    ? cefrColors[a.lesson.cefrLevel]
                    : null;
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-medium text-slate-700 text-sm">
                            {a.lesson.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`${cat.bg} ${cat.color} text-xs font-medium px-2 py-0.5 rounded-full`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
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
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
                      <td className="py-2.5 px-4 text-xs text-slate-400">
                        {tab === "completed" && a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString()
                          : new Date(a.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <a
                          href={`/student/lessons/${a.lesson.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Open <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
