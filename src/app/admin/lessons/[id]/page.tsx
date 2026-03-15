import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LessonViewer from "@/components/LessonViewer";

export default async function AdminLessonPage({
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
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { student: { select: { name: true, email: true } } },
      },
    },
  });

  if (!lesson) redirect("/admin");

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
      showTeacherNotes={true}
      backUrl="/admin"
      role="ADMIN"
      userName={dbUser.name}
    />
  );
}
