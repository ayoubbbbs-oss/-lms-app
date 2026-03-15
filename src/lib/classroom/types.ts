export type Slide = {
  order: number;
  title?: string;
  contentUrl?: string;
  contentType?: "image" | "pdf_page" | "video" | "html" | "text";
  content?: string; // Rich text / HTML content for text-based slides
  teacherNotes?: string;
};

export type SlideChangePayload = {
  slideIndex: number;
  timestamp: number;
};

export type SessionStatusPayload = {
  status: "WAITING" | "ACTIVE" | "PAUSED" | "ENDED";
  timestamp: number;
};

export function parseSlidesFromLesson(slides: unknown): Slide[] {
  if (!slides) return [];
  if (!Array.isArray(slides)) return [];
  return (slides as Slide[]).sort((a, b) => a.order - b.order);
}

/**
 * Generates placeholder slides from a lesson's legacy fields
 * when no explicit slides JSON exists.
 */
export function buildFallbackSlides(lesson: {
  contentUrl?: string | null;
  contentType?: string | null;
  teacherNotes?: string | null;
  title: string;
}): Slide[] {
  return [
    {
      order: 0,
      title: lesson.title,
      contentUrl: lesson.contentUrl || undefined,
      contentType: (lesson.contentType as Slide["contentType"]) || "text",
      teacherNotes: lesson.teacherNotes || undefined,
    },
  ];
}
