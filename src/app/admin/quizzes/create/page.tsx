import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import QuizBuilder from "@/components/quiz/QuizBuilder";

export default async function CreateQuizPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  return (
    <DashboardLayout role="ADMIN" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Create Quiz</h1>
        <p className="text-xs text-slate-500">Build an interactive assessment</p>
      </div>
      <QuizBuilder />
    </DashboardLayout>
  );
}
