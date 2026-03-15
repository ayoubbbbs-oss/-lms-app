import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LessonViewer from "@/components/LessonViewer";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "STUDENT") redirect("/");

  // Only allow access if lesson is assigned to this student
  const assignment = await prisma.assignment.findFirst({
    where: { studentId: dbUser.id, lessonId: id },
    include: { lesson: true },
  });

  if (!assignment) redirect("/student");

  // Mark as in progress if not started
  if (assignment.status === "NOT_STARTED") {
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  const lesson = assignment.lesson;

  return (
    <LessonViewer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        contentUrl: lesson.contentUrl,
        contentType: lesson.contentType,
        category: lesson.category,
        cefrLevel: lesson.cefrLevel,
        teacherNotes: lesson.teacherNotes,
      }}
      showTeacherNotes={false}
      backUrl="/student"
      role="STUDENT"
      userName={dbUser.name}
    />
  );
}
