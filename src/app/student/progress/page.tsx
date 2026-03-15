import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentProgressClient from "./StudentProgressClient";

export default async function StudentProgressPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "STUDENT" && dbUser.role !== "ADMIN")) redirect("/");

  const assignments = await prisma.assignment.findMany({
    where: dbUser.role === "ADMIN" ? {} : { studentId: dbUser.id },
    orderBy: { assignedAt: "desc" },
    include: { lesson: true },
  });

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const notStarted = assignments.filter(
    (a) => a.status === "NOT_STARTED"
  ).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // CEFR breakdown
  const cefrBreakdown: Record<string, { total: number; completed: number }> = {};
  assignments.forEach((a) => {
    const level = a.lesson.cefrLevel || "Unset";
    if (!cefrBreakdown[level]) cefrBreakdown[level] = { total: 0, completed: 0 };
    cefrBreakdown[level].total++;
    if (a.status === "COMPLETED") cefrBreakdown[level].completed++;
  });

  // Category breakdown
  const categoryBreakdown: Record<
    string,
    { total: number; completed: number; inProgress: number }
  > = {};
  assignments.forEach((a) => {
    const cat = a.lesson.category;
    if (!categoryBreakdown[cat])
      categoryBreakdown[cat] = { total: 0, completed: 0, inProgress: 0 };
    categoryBreakdown[cat].total++;
    if (a.status === "COMPLETED") categoryBreakdown[cat].completed++;
    if (a.status === "IN_PROGRESS") categoryBreakdown[cat].inProgress++;
  });

  return (
    <StudentProgressClient
      userName={dbUser.name}
      stats={{ total, completed, inProgress, notStarted, completionPercentage }}
      cefrBreakdown={cefrBreakdown}
      categoryBreakdown={categoryBreakdown}
      assignments={assignments.map((a) => ({
        id: a.id,
        status: a.status,
        assignedAt: a.assignedAt.toISOString(),
        completedAt: a.completedAt?.toISOString() ?? null,
        lesson: {
          id: a.lesson.id,
          title: a.lesson.title,
          category: a.lesson.category,
          cefrLevel: a.lesson.cefrLevel,
        },
      }))}
    />
  );
}
