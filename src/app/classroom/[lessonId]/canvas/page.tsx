import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CanvasClient from "./CanvasClient";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) redirect("/");

  // Students must have an assignment
  if (dbUser.role === "STUDENT") {
    const assignment = await prisma.assignment.findFirst({
      where: { studentId: dbUser.id, lessonId },
    });
    if (!assignment) redirect("/student");
  }

  const role = dbUser.role === "ADMIN" ? "TEACHER" : (dbUser.role as "TEACHER" | "STUDENT");

  return (
    <CanvasClient
      lessonId={lessonId}
      lessonTitle={lesson.title}
      role={role}
      userName={dbUser.name}
    />
  );
}
