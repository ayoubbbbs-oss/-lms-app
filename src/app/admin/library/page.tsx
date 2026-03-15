"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LessonCard from "@/components/LessonCard";
import CefrFilter from "@/components/CefrFilter";
import {
  createLesson,
  assignLessonToMultiple,
  deleteLesson,
} from "../actions";
import { categoryConfig, cefrLevels } from "@/lib/lessonHelpers";
import {
  Plus,
  X,
  Search,
  BookOpen,
  LayoutGrid,
  List,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  contentType: string | null;
  category: string;
  cefrLevel: string | null;
  teacherNotes: string | null;
  createdAt: string;
  _count: { assignments: number };
};

type Student = { id: string; name: string; email: string };

export default function LibraryPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [userName, setUserName] = useState("");
  const [cefrFilter, setCefrFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLessonId, setAssignLessonId] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/admin/api");
    const data = await res.json();
    setLessons(data.lessons);
    setStudents(data.students);
    setUserName(data.user?.name || "Admin");
  }

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  const filtered = lessons.filter((l) => {
    if (cefrFilter && l.cefrLevel !== cefrFilter) return false;
    if (categoryFilter && l.category !== categoryFilter) return false;
    if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createLesson(formData);
      if (result.error) showMsg(result.error);
      else {
        showMsg("Lesson created successfully!");
        setShowCreateModal(false);
        fetchData();
      }
    });
  }

  async function handleAssign() {
    if (!assignLessonId || selectedStudents.length === 0) return;
    startTransition(async () => {
      const result = await assignLessonToMultiple(assignLessonId, selectedStudents);
      if (result.success) {
        showMsg(`Assigned to ${result.assigned} student(s)!`);
        setShowAssignModal(false);
        setAssignLessonId(null);
        setSelectedStudents([]);
        fetchData();
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson and all its assignments?")) return;
    startTransition(async () => {
      await deleteLesson(id);
      showMsg("Lesson deleted");
      fetchData();
    });
  }

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {/* Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-[60] bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Lesson Library
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} in your library
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Lesson
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {/* Search */}
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

              {/* Category */}
              <select
                value={categoryFilter || ""}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryConfig).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* CEFR */}
              <CefrFilter selected={cefrFilter} onChange={setCefrFilter} />

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results info */}
        {(cefrFilter || categoryFilter || searchQuery) && (
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-slate-500">
              Showing {filtered.length} of {lessons.length} lessons
            </p>
            <button
              onClick={() => {
                setCefrFilter(null);
                setCategoryFilter(null);
                setSearchQuery("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid / List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No lessons found</p>
            <p className="text-slate-400 text-sm mt-1">
              {lessons.length === 0
                ? 'Click "New Lesson" to create your first lesson'
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                category={lesson.category}
                cefrLevel={lesson.cefrLevel}
                contentType={lesson.contentType}
                assignmentCount={lesson._count.assignments}
                showActions={["classroom", "launch", "assign", "delete"]}
                onClassroom={(id) => window.open(`/classroom/${id}`, "_blank")}
                onLaunch={(id) => window.open(`/admin/lessons/${id}`, "_blank")}
                onAssign={(id) => {
                  setAssignLessonId(id);
                  setSelectedStudents([]);
                  setShowAssignModal(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-3 px-5 font-semibold text-slate-500">Lesson</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500">Category</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500">CEFR</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500">Type</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500">Assigned</th>
                  <th className="text-right py-3 px-5 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lesson) => {
                  const cat = categoryConfig[lesson.category] || categoryConfig.GENERAL_ENGLISH;
                  return (
                    <tr key={lesson.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{cat.icon}</span>
                          <div>
                            <p className="font-medium text-slate-800">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`${cat.bg} ${cat.color} text-xs font-medium px-2 py-0.5 rounded-full`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {lesson.cefrLevel ? (
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {lesson.cefrLevel}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-500 capitalize">{lesson.contentType || "-"}</td>
                      <td className="py-3 px-5 text-slate-600 font-medium">{lesson._count.assignments}</td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => window.open(`/admin/lessons/${lesson.id}`, "_blank")}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-blue-50"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => {
                              setAssignLessonId(lesson.id);
                              setSelectedStudents([]);
                              setShowAssignModal(true);
                            }}
                            className="text-green-600 hover:text-green-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-green-50"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── CREATE LESSON MODAL ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Create New Lesson</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form action={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input name="title" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Present Simple Tense" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(categoryConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CEFR Level</label>
                  <select name="cefrLevel" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select level...</option>
                    {cefrLevels.map((l) => (<option key={l} value={l}>{l}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content URL</label>
                  <input name="contentUrl" type="url" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                  <select name="contentType" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="interactive">Interactive</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Notes</label>
                <textarea name="teacherNotes" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notes visible to teachers when launching this lesson..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isPending} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isPending ? "Creating..." : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ASSIGN MODAL ─── */}
      {showAssignModal && assignLessonId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Assign to Students</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Lesson: <span className="font-medium text-slate-700">{lessons.find((l) => l.id === assignLessonId)?.title}</span>
              </p>
              {students.length === 0 ? (
                <p className="text-sm text-slate-400">No students registered yet.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setSelectedStudents(selectedStudents.length === students.length ? [] : students.map((s) => s.id))} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="text-xs text-slate-400">{selectedStudents.length} selected</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {students.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={(e) => {
                          if (e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                          else setSelectedStudents(selectedStudents.filter((id) => id !== s.id));
                        }} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleAssign} disabled={isPending || selectedStudents.length === 0} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {isPending ? "Assigning..." : `Assign to ${selectedStudents.length} student(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
