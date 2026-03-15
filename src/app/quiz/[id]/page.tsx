import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizPlayer from "@/components/quiz/QuizPlayer";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const quiz = await prisma.placementTest.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!quiz) redirect("/student");

  // Check if already submitted
  const existingScore = await prisma.studentScore.findUnique({
    where: { studentId_testId: { studentId: dbUser.id, testId: id } },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {existingScore ? (
        <div className="max-w-lg mx-auto py-12 px-4 text-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Already Completed</h1>
            <p className="text-sm text-slate-500 mb-4">You scored {existingScore.score}/{existingScore.maxScore}</p>
            {existingScore.cefrResult && (
              <p className="text-lg font-bold text-blue-600">CEFR Level: {existingScore.cefrResult}</p>
            )}
            <a href="/student" className="inline-block mt-4 px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200">
              Back to Dashboard
            </a>
          </div>
        </div>
      ) : (
        <QuizPlayer
          testId={quiz.id}
          title={quiz.title}
          description={quiz.description}
          cefrLevel={quiz.cefrLevel}
          questions={quiz.questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options as string[] | null,
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: q.order,
          }))}
        />
      )}
    </div>
  );
}
