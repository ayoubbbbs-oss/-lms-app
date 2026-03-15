import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { Plus, FileText, Users, Trophy } from "lucide-react";

export default async function AdminQuizzes() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  const quizzes = await prisma.placementTest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, scores: true } },
    },
  });

  return (
    <DashboardLayout role="ADMIN" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Quizzes & Tests</h1>
          <p className="text-xs text-slate-500">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</p>
        </div>
        <Link
          href="/admin/quizzes/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={15} /> New Quiz
        </Link>
      </div>

      <div className="p-4">
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-medium">No quizzes yet</p>
            <p className="text-xs text-slate-400 mt-1">Create your first quiz to test student knowledge</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/admin/quizzes/${quiz.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  {quiz.cefrLevel && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">{quiz.cefrLevel}</span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{quiz.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><FileText size={12} />{quiz._count.questions} Q</span>
                  <span className="flex items-center gap-1"><Users size={12} />{quiz._count.scores} taken</span>
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold ${quiz.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {quiz.isActive ? "Active" : "Draft"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
