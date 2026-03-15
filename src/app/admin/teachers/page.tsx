"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { linkTeacherStudent } from "../actions";
import {
  UserCheck,
  Users,
  Search,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  UserPlus,
} from "lucide-react";

type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  teacherStudents: {
    student: { id: string; name: string; email: string };
  }[];
};

type Student = { id: string; name: string; email: string };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTeacherId, setLinkTeacherId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/admin/api");
    const data = await res.json();
    setTeachers(data.teachers);
    setStudents(data.students);
    setUserName(data.user?.name || "Admin");
  }

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLinked = teachers.reduce(
    (sum, t) => sum + t.teacherStudents.length,
    0
  );

  async function handleLink() {
    if (!linkTeacherId || !selectedStudent) return;
    const formData = new FormData();
    formData.set("teacherId", linkTeacherId);
    formData.set("studentId", selectedStudent);

    startTransition(async () => {
      const result = await linkTeacherStudent(formData);
      if (result.error) showMsg(result.error);
      else {
        showMsg("Student linked to teacher!");
        setShowLinkModal(false);
        setLinkTeacherId(null);
        setSelectedStudent("");
        fetchData();
      }
    });
  }

  function getUnlinkedStudents(teacherId: string) {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return students;
    const linkedIds = new Set(teacher.teacherStudents.map((ts) => ts.student.id));
    return students.filter((s) => !linkedIds.has(s.id));
  }

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {message && (
        <div className="fixed top-4 right-4 z-[60] bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Teacher Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserCheck size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{teachers.length}</p>
              <p className="text-xs text-slate-500">Total Teachers</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Link2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalLinked}</p>
              <p className="text-xs text-slate-500">Teacher-Student Links</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{students.length}</p>
              <p className="text-xs text-slate-500">Available Students</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search teachers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Teacher Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <UserCheck size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No teachers found</p>
            <p className="text-slate-400 text-sm mt-1">
              Teachers will appear here after signing up and being promoted
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((teacher) => {
              const isExpanded = expandedTeacher === teacher.id;
              return (
                <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-5">
                    <button onClick={() => setExpandedTeacher(isExpanded ? null : teacher.id)}
                      className="flex items-center gap-4 text-left flex-1">
                      <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{teacher.name}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Mail size={12} /> {teacher.email}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">
                          {teacher.teacherStudents.length}
                        </p>
                        <p className="text-[11px] text-slate-400">Students</p>
                      </div>

                      <button
                        onClick={() => {
                          setLinkTeacherId(teacher.id);
                          setSelectedStudent("");
                          setShowLinkModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-purple-600 text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                      >
                        <UserPlus size={14} />
                        Link Student
                      </button>

                      <button onClick={() => setExpandedTeacher(isExpanded ? null : teacher.id)}>
                        {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Linked Students */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      {teacher.teacherStudents.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center">
                          No students linked yet. Click &quot;Link Student&quot; to assign students.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {teacher.teacherStudents.map(({ student }) => (
                            <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                                <p className="text-xs text-slate-400 truncate">{student.email}</p>
                              </div>
                            </div>
                          ))}
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

      {/* ─── LINK STUDENT MODAL ─── */}
      {showLinkModal && linkTeacherId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Link Student to Teacher</h2>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Teacher: <span className="font-medium text-slate-700">{teachers.find((t) => t.id === linkTeacherId)?.name}</span>
              </p>

              {(() => {
                const available = getUnlinkedStudents(linkTeacherId);
                if (available.length === 0) {
                  return <p className="text-sm text-slate-400">All students are already linked to this teacher.</p>;
                }
                return (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {available.map((s) => (
                      <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedStudent === s.id ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50 border border-transparent"}`}>
                        <input type="radio" name="student" value={s.id} checked={selectedStudent === s.id} onChange={() => setSelectedStudent(s.id)}
                          className="w-4 h-4 text-purple-600 border-slate-300" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowLinkModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleLink} disabled={isPending || !selectedStudent}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {isPending ? "Linking..." : "Link Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
