import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherStudentsClient from "./TeacherStudentsClient";

export default async function TeacherStudentsPage() {
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
                  id: true,
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
    <TeacherStudentsClient
      userName={dbUser.name}
      students={linkedStudents.map((ls) => ({
        id: ls.student.id,
        name: ls.student.name,
        email: ls.student.email,
        linkedAt: ls.assignedAt.toISOString(),
        assignments: ls.student.studentAssignments.map((a) => ({
          id: a.id,
          status: a.status,
          assignedAt: a.assignedAt.toISOString(),
          completedAt: a.completedAt?.toISOString() || null,
          lesson: {
            id: a.lesson.id,
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
