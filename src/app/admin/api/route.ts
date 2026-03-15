import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const [lessons, students, teachers, assignments, teacherStudentLinks] =
    await Promise.all([
      prisma.lesson.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { assignments: true } } },
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { name: "asc" },
        include: {
          studentAssignments: {
            orderBy: { assignedAt: "desc" },
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  cefrLevel: true,
                  contentType: true,
                },
              },
            },
          },
          studentTeachers: {
            include: {
              teacher: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "TEACHER" },
        orderBy: { name: "asc" },
        include: {
          teacherStudents: {
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.assignment.findMany({
        orderBy: { assignedAt: "desc" },
        include: {
          lesson: {
            select: {
              title: true,
              category: true,
              cefrLevel: true,
            },
          },
          student: { select: { name: true, email: true } },
        },
      }),
      prisma.teacherStudent.findMany({
        include: {
          teacher: { select: { id: true, name: true } },
          student: { select: { id: true, name: true } },
        },
      }),
    ]);

  return NextResponse.json({
    lessons,
    students,
    teachers,
    assignments,
    teacherStudentLinks,
    user: dbUser,
  });
}
