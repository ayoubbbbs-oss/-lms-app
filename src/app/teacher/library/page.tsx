import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getCategoryConfig, cefrColors } from "@/lib/lessonHelpers";
import { BookOpen, Play, ClipboardList } from "lucide-react";

export default async function TeacherLibraryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN")) redirect("/");

  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout role="TEACHER" userName={dbUser.name}>
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Lesson Library</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Browse and assign lessons to your students
        </p>
      </div>

      <div className="px-8 py-6">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">
              No lessons available yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Lessons will appear here once an admin creates them
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const cat = getCategoryConfig(lesson.category);
              const cefr = lesson.cefrLevel
                ? cefrColors[lesson.cefrLevel]
                : null;

              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className={`text-xs font-medium ${cat.color}`}>
                        {cat.label}
                      </span>
                      {cefr && (
                        <span
                          className={`${cefr.bg} ${cefr.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto`}
                        >
                          {lesson.cefrLevel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <a
                      href={`/teacher/students?assign=${lesson.id}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <ClipboardList size={12} />
                      Assign
                    </a>
                    <a
                      href={`/teacher/classroom/${lesson.id}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <Play size={12} />
                      Launch
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
