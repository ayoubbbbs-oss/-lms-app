import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { FileText, Users, Trophy, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  const quiz = await prisma.placementTest.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      scores: {
        include: { student: { select: { name: true, email: true } } },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!quiz) redirect("/admin/quizzes");

  const avgScore = quiz.scores.length > 0
    ? Math.round(quiz.scores.reduce((s, sc) => s + (sc.score / sc.maxScore) * 100, 0) / quiz.scores.length)
    : 0;

  return (
    <DashboardLayout role="ADMIN" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">{quiz.title}</h1>
          <p className="text-xs text-slate-500">{quiz.description || "No description"}</p>
        </div>
        <div className="flex items-center gap-2">
          {quiz.cefrLevel && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{quiz.cefrLevel}</span>
          )}
          <Link href={`/quiz/${quiz.id}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600">
            <ExternalLink size={12} /> Preview
          </Link>
        </div>
      </div>

      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
            <div><p className="text-xl font-bold text-slate-800">{quiz.questions.length}</p><p className="text-xs text-slate-500">Questions</p></div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center"><Users size={16} className="text-green-600" /></div>
            <div><p className="text-xl font-bold text-green-600">{quiz.scores.length}</p><p className="text-xs text-slate-500">Submissions</p></div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center"><Trophy size={16} className="text-amber-600" /></div>
            <div><p className="text-xl font-bold text-amber-600">{avgScore}%</p><p className="text-xs text-slate-500">Avg Score</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Questions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200"><h2 className="text-sm font-bold text-slate-700">Questions</h2></div>
            <div className="p-3 space-y-2">
              {quiz.questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-xs text-slate-700">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{q.type.replace("_", " ")}</span>
                      <span className="text-[10px] text-green-600 flex items-center gap-0.5"><CheckCircle2 size={10} />{q.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scores */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200"><h2 className="text-sm font-bold text-slate-700">Submissions</h2></div>
            {quiz.scores.length === 0 ? (
              <div className="p-6 text-center"><p className="text-xs text-slate-400">No submissions yet</p></div>
            ) : (
              <div className="p-3 space-y-2">
                {quiz.scores.map((sc) => {
                  const pct = Math.round((sc.score / sc.maxScore) * 100);
                  return (
                    <div key={sc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-slate-700">{sc.student.name}</p>
                        <p className="text-[10px] text-slate-400">{sc.student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{sc.score}/{sc.maxScore}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pct >= 70 ? "bg-green-100 text-green-700" : pct >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{pct}%</span>
                        {sc.cefrResult && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{sc.cefrResult}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
