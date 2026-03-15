"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Slide } from "@/lib/classroom/types";
import { FileText, Image as ImageIcon, Video, Globe } from "lucide-react";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-50%" : "50%",
    opacity: 0,
  }),
};

const transition = {
  x: { type: "spring" as const, stiffness: 350, damping: 32 },
  opacity: { duration: 0.2 },
};

export default function SlideRenderer({
  slide,
  slideIndex,
  direction,
}: {
  slide: Slide;
  slideIndex: number;
  direction: number;
}) {
  const contentTypeIcon: Record<string, React.ReactNode> = {
    image: <ImageIcon size={40} className="text-slate-300" />,
    pdf_page: <FileText size={40} className="text-slate-300" />,
    video: <Video size={40} className="text-slate-300" />,
    html: <Globe size={40} className="text-slate-300" />,
    text: <FileText size={40} className="text-slate-300" />,
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3">
      <div className="relative w-full h-full bg-white rounded-xl shadow-lg ring-1 ring-slate-200/60 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slideIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 flex items-center justify-center"
          >
            {slide.contentUrl ? (
              slide.contentType === "video" ? (
                <video
                  src={slide.contentUrl}
                  controls
                  className="max-w-full max-h-full object-contain"
                />
              ) : slide.contentType === "image" ? (
                <img
                  src={slide.contentUrl}
                  alt={slide.title || `Slide ${slideIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={slide.contentUrl}
                  title={slide.title || `Slide ${slideIndex + 1}`}
                  className="w-full h-full border-0"
                />
              )
            ) : slide.content ? (
              <div className="p-6 w-full h-full overflow-y-auto">
                {slide.title && (
                  <h2 className="text-2xl font-bold text-slate-800 mb-5">
                    {slide.title}
                  </h2>
                )}
                <div
                  className="prose prose-slate prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: slide.content }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10">
                {contentTypeIcon[slide.contentType || "text"]}
                <h2 className="text-xl font-bold text-slate-700 mt-4">
                  {slide.title || `Slide ${slideIndex + 1}`}
                </h2>
                <p className="text-slate-400 mt-1.5 text-sm">
                  No content set for this slide
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
