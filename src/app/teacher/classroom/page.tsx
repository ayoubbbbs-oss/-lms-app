import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherClassroomClient from "./TeacherClassroomClient";

export default async function TeacherClassroomPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "TEACHER") redirect("/");

  // Get all students linked to this teacher
  const linkedStudents = await prisma.teacherStudent.findMany({
    where: { teacherId: dbUser.id },
    include: {
      student: {
        include: {
          studentAssignments: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  description: true,
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

  // Build unique lessons from all student assignments
  const lessonMap = new Map<
    string,
    {
      id: string;
      title: string;
      description: string | null;
      contentType: string | null;
      category: string;
      cefrLevel: string | null;
      studentCount: number;
      completedCount: number;
      inProgressCount: number;
    }
  >();

  for (const ls of linkedStudents) {
    for (const assignment of ls.student.studentAssignments) {
      const lesson = assignment.lesson;
      const existing = lessonMap.get(lesson.id);
      if (existing) {
        existing.studentCount += 1;
        if (assignment.status === "COMPLETED") existing.completedCount += 1;
        if (assignment.status === "IN_PROGRESS") existing.inProgressCount += 1;
      } else {
        lessonMap.set(lesson.id, {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.contentType,
          category: lesson.category,
          cefrLevel: lesson.cefrLevel,
          studentCount: 1,
          completedCount: assignment.status === "COMPLETED" ? 1 : 0,
          inProgressCount: assignment.status === "IN_PROGRESS" ? 1 : 0,
        });
      }
    }
  }

  // Get active classroom sessions for this teacher
  const activeSessions = await prisma.classroomSession.findMany({
    where: {
      teacherId: dbUser.id,
      status: { not: "ENDED" },
    },
    select: {
      id: true,
      lessonId: true,
      status: true,
      startedAt: true,
    },
  });

  const activeSessionMap = new Map(
    activeSessions.map((s) => [s.lessonId, s])
  );

  const lessons = Array.from(lessonMap.values()).map((lesson) => ({
    ...lesson,
    activeSession: activeSessionMap.get(lesson.id)
      ? {
          id: activeSessionMap.get(lesson.id)!.id,
          status: activeSessionMap.get(lesson.id)!.status,
          startedAt: activeSessionMap.get(lesson.id)!.startedAt.toISOString(),
        }
      : null,
  }));

  return (
    <TeacherClassroomClient
      userName={dbUser.name}
      lessons={lessons}
      totalStudents={linkedStudents.length}
      activeSessions={activeSessions.length}
    />
  );
}
