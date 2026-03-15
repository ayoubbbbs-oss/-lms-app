import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentHomeworkClient from "./StudentHomeworkClient";

export default async function StudentHomeworkPage() {
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

  return (
    <StudentHomeworkClient
      userName={dbUser.name}
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
