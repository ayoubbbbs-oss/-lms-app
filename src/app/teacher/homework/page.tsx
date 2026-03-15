import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import { ClipboardList, Plus, CheckCircle, Clock, Circle } from "lucide-react";

export default async function TeacherHomeworkPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN")) redirect("/");

  // Get IDs of students linked to this teacher
  const linkedStudents = await prisma.teacherStudent.findMany({
    where: { teacherId: dbUser.id },
    select: { studentId: true },
  });
  const studentIds = linkedStudents.map((ls) => ls.studentId);

  // Fetch assignments for those students, created by this teacher
  const assignments = await prisma.assignment.findMany({
    where: {
      assignedBy: dbUser.id,
      studentId: { in: studentIds },
    },
    orderBy: { assignedAt: "desc" },
    include: {
      lesson: {
        select: {
          title: true,
          category: true,
          cefrLevel: true,
        },
      },
      student: {
        select: { name: true, email: true },
      },
    },
  });

  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const notStarted = assignments.filter(
    (a) => a.status === "NOT_STARTED"
  ).length;

  return (
    <DashboardLayout role="TEACHER" userName={dbUser.name}>
      <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Homework</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage assignments for your students
          </p>
        </div>
        <a
          href="/teacher/library"
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Create Homework
        </a>
      </div>

      <div className="px-8 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Circle size={14} className="text-slate-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{notStarted}</p>
              <p className="text-xs text-slate-500">Not Started</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{inProgress}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{completed}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>

        {/* Assignment list */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">
              No homework assigned yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Go to the lesson library to assign lessons to students
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">
                    Lesson
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const cat = getCategoryConfig(a.lesson.category);
                  const cefr = a.lesson.cefrLevel
                    ? cefrColors[a.lesson.cefrLevel]
                    : null;

                  return (
                    <tr
                      key={a.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="text-sm font-medium text-slate-700">
                            {a.lesson.title}
                          </span>
                          {cefr && (
                            <span
                              className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
                            >
                              {a.lesson.cefrLevel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-700">
                          {a.student.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {a.student.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            a.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : a.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {a.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(a.assignedAt).toLocaleDateString()}
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
