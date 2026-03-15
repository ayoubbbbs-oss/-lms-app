import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherDashboardClient from "./TeacherDashboardClient";

export default async function TeacherDashboard() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "TEACHER") redirect("/");

  const linkedStudents = await prisma.teacherStudent.findMany({
    where: { teacherId: dbUser.id },
    include: {
      student: {
        include: {
          studentAssignments: {
            orderBy: { assignedAt: "desc" },
            include: {
              lesson: {
                select: {
                  title: true,
                  contentType: true,
                  category: true,
                  cefrLevel: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <TeacherDashboardClient
      userName={dbUser.name}
      students={linkedStudents.map((ls) => ({
        id: ls.student.id,
        name: ls.student.name,
        email: ls.student.email,
        assignments: ls.student.studentAssignments.map((a) => ({
          id: a.id,
          status: a.status,
          assignedAt: a.assignedAt.toISOString(),
          lesson: {
            title: a.lesson.title,
            contentType: a.lesson.contentType,
            category: a.lesson.category,
            cefrLevel: a.lesson.cefrLevel,
          },
        })),
      }))}
    />
  );
}
