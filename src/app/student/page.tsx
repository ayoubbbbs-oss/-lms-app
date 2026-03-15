import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "STUDENT" && dbUser.role !== "ADMIN")) redirect("/");

  const isAdmin = dbUser.role === "ADMIN";

  // Admin sees ALL assignments across all students; Student sees only their own
  const assignments = isAdmin
    ? await prisma.assignment.findMany({
        orderBy: { assignedAt: "desc" },
        take: 20,
        include: { lesson: true },
      })
    : await prisma.assignment.findMany({
        where: { studentId: dbUser.id },
        orderBy: { assignedAt: "desc" },
        include: { lesson: true },
      });

  return (
    <StudentDashboardClient
      userName={isAdmin ? "Admin (Student View)" : dbUser.name}
      assignments={assignments.map((a) => ({
        id: a.id,
        status: a.status,
        assignedAt: a.assignedAt.toISOString(),
        lesson: {
          id: a.lesson.id,
          title: a.lesson.title,
          description: a.lesson.description,
          contentUrl: a.lesson.contentUrl,
          contentType: a.lesson.contentType,
          category: a.lesson.category,
          cefrLevel: a.lesson.cefrLevel,
        },
      }))}
    />
  );
}
