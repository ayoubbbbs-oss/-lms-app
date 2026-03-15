"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import { removeAssignment } from "../actions";
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
} from "lucide-react";

type StudentAssignment = {
  id: string;
  status: string;
  assignedAt: string;
  lesson: {
    id: string;
    title: string;
    category: string;
    cefrLevel: string | null;
    contentType: string | null;
  };
};

type Student = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  studentAssignments: StudentAssignment[];
  studentTeachers: {
    teacher: { id: string; name: string; email: string };
  }[];
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/admin/api");
    const data = await res.json();
    setStudents(data.students);
    setUserName(data.user?.name || "Admin");
  }

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssignments = students.reduce((sum, s) => sum + s.studentAssignments.length, 0);
  const completedTotal = students.reduce(
    (sum, s) => sum + s.studentAssignments.filter((a) => a.status === "COMPLETED").length, 0
  );
  const inProgressTotal = students.reduce(
    (sum, s) => sum + s.studentAssignments.filter((a) => a.status === "IN_PROGRESS").length, 0
  );

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {message && (
        <div className="fixed top-4 right-4 z-[60] bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {students.length} student{students.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Users size={20} className="text-blue-600" />, label: "Total Students", value: students.length, bg: "bg-blue-50" },
            { icon: <BookOpen size={20} className="text-purple-600" />, label: "Total Assignments", value: totalAssignments, bg: "bg-purple-50" },
            { icon: <CheckCircle2 size={20} className="text-green-600" />, label: "Completed", value: completedTotal, bg: "bg-green-50" },
            { icon: <Clock size={20} className="text-amber-600" />, label: "In Progress", value: inProgressTotal, bg: "bg-amber-50" },
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

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
            </div>
            <div className="flex gap-1">
              {[
                { key: null, label: "All Students" },
                { key: "has_assignments", label: "With Lessons" },
                { key: "no_assignments", label: "No Lessons" },
              ].map((f) => (
                <button key={f.key || "all"} onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === f.key ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No students found</p>
            <p className="text-slate-400 text-sm mt-1">Students will appear here after they sign up</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered
              .filter((s) => {
                if (statusFilter === "has_assignments") return s.studentAssignments.length > 0;
                if (statusFilter === "no_assignments") return s.studentAssignments.length === 0;
                return true;
              })
              .map((student) => {
                const completed = student.studentAssignments.filter((a) => a.status === "COMPLETED").length;
                const inProgress = student.studentAssignments.filter((a) => a.status === "IN_PROGRESS").length;
                const notStarted = student.studentAssignments.filter((a) => a.status === "NOT_STARTED").length;
                const total = student.studentAssignments.length;
                const isExpanded = expandedStudent === student.id;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Row */}
                    <button onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{student.name}</h3>
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Mail size={12} /> {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        {/* Teacher */}
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Teacher</p>
                          <p className="text-sm font-medium text-slate-600">
                            {student.studentTeachers.length > 0
                              ? student.studentTeachers.map((t) => t.teacher.name).join(", ")
                              : "Unassigned"}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-slate-600 font-medium">{completed}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-slate-600 font-medium">{inProgress}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-slate-600 font-medium">{notStarted}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="w-28">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">{pct}%</span>
                            <span className="text-[10px] text-slate-400">{completed}/{total}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="border-t border-slate-100">
                        {student.studentAssignments.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm text-slate-400">No lessons assigned to this student yet.</p>
                            <p className="text-xs text-slate-300 mt-1">Go to the Library to assign lessons.</p>
                          </div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">Lesson</th>
                                <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">Category</th>
                                <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">CEFR</th>
                                <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">Status</th>
                                <th className="text-left py-2.5 px-5 font-semibold text-slate-400 text-xs">Assigned</th>
                                <th className="text-right py-2.5 px-5 font-semibold text-slate-400 text-xs"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {student.studentAssignments.map((a) => {
                                const cat = getCategoryConfig(a.lesson.category);
                                const cefr = a.lesson.cefrLevel ? cefrColors[a.lesson.cefrLevel] : null;
                                return (
                                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="py-2.5 px-5">
                                      <div className="flex items-center gap-2">
                                        <span>{cat.icon}</span>
                                        <span className="font-medium text-slate-700">{a.lesson.title}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-5">
                                      <span className={`${cat.bg} ${cat.color} text-xs font-medium px-2 py-0.5 rounded-full`}>{cat.label}</span>
                                    </td>
                                    <td className="py-2.5 px-5">
                                      {cefr ? (
                                        <span className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>{a.lesson.cefrLevel}</span>
                                      ) : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-5">
                                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                        a.status === "COMPLETED" ? "bg-green-100 text-green-700"
                                        : a.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700"
                                        : "bg-slate-100 text-slate-500"
                                      }`}>{a.status.replace("_", " ")}</span>
                                    </td>
                                    <td className="py-2.5 px-5 text-slate-400 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                                    <td className="py-2.5 px-5 text-right">
                                      <button onClick={() => {
                                        startTransition(async () => {
                                          await removeAssignment(a.id);
                                          showMsg("Assignment removed");
                                          fetchData();
                                        });
                                      }} className="text-red-400 hover:text-red-600 text-xs font-medium">
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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
