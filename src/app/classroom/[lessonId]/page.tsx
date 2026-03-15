import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  parseSlidesFromLesson,
  buildFallbackSlides,
} from "@/lib/classroom/types";
import ClassroomTeacher from "./ClassroomTeacher";
import ClassroomStudent from "./ClassroomStudent";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  // ── Auth ──
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  // ── Load lesson ──
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });
  if (!lesson) redirect("/");

  // ── Parse slides ──
  let slides = parseSlidesFromLesson(lesson.slides);
  if (slides.length === 0) {
    slides = buildFallbackSlides(lesson);
  }

  const lessonMeta = {
    title: lesson.title,
    category: lesson.category,
    cefrLevel: lesson.cefrLevel,
  };

  // ── TEACHER / ADMIN flow ──
  if (dbUser.role === "TEACHER" || dbUser.role === "ADMIN") {
    // Find or create active session
    let session = await prisma.classroomSession.findFirst({
      where: { lessonId, status: { not: "ENDED" } },
    });

    if (!session) {
      session = await prisma.classroomSession.create({
        data: {
          lessonId,
          teacherId: dbUser.id,
          status: "ACTIVE",
        },
      });
    }

    return (
      <ClassroomTeacher
        sessionId={session.id}
        lessonId={lessonId}
        slides={slides}
        initialSlide={session.currentSlide}
        lesson={lessonMeta}
        backUrl={dbUser.role === "ADMIN" ? "/admin/library" : "/teacher"}
        userName={dbUser.name}
      />
    );
  }

  // ── STUDENT flow ──
  if (dbUser.role === "STUDENT") {
    // Verify student has assignment for this lesson
    const assignment = await prisma.assignment.findFirst({
      where: { studentId: dbUser.id, lessonId },
    });
    if (!assignment) redirect("/student");

    // Find active session
    const session = await prisma.classroomSession.findFirst({
      where: { lessonId, status: { not: "ENDED" } },
    });

    if (!session) {
      // No active session — show waiting state
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 text-center shadow-lg border border-slate-200 max-w-md">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Waiting for Teacher
            </h2>
            <p className="text-sm text-slate-500 mb-1">
              The classroom session for &quot;{lesson.title}&quot; hasn&apos;t started yet.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              This page will detect the session automatically. Please keep it
              open or check back later.
            </p>
            <a
              href="/student"
              className="inline-block mt-6 px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }

    // Mark assignment as in progress
    if (assignment.status === "NOT_STARTED") {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return (
      <ClassroomStudent
        sessionId={session.id}
        lessonId={lessonId}
        slides={slides}
        initialSlide={session.currentSlide}
        lesson={lessonMeta}
        backUrl="/student"
        userName={dbUser.name}
      />
    );
  }

  redirect("/");
}
