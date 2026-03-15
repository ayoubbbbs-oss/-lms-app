export const categoryConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  GENERAL_ENGLISH: {
    label: "General English",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "📘",
  },
  BUSINESS_ENGLISH: {
    label: "Business English",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "💼",
  },
  BEGINNERS: {
    label: "Beginners",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "🌱",
  },
  GRAMMAR: {
    label: "Grammar",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "📝",
  },
  CONVERSATION: {
    label: "Conversation",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "💬",
  },
  PRONUNCIATION: {
    label: "Pronunciation",
    color: "text-pink-700",
    bg: "bg-pink-50",
    border: "border-pink-200",
    icon: "🗣️",
  },
  VOCABULARY: {
    label: "Vocabulary",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    icon: "📚",
  },
  EXAM_PREP: {
    label: "Exam Prep",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "🎯",
  },
  YOUNG_LEARNERS: {
    label: "Young Learners",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: "🧒",
  },
};

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const cefrColors: Record<string, { bg: string; text: string }> = {
  A1: { bg: "bg-emerald-100", text: "text-emerald-700" },
  A2: { bg: "bg-green-100", text: "text-green-700" },
  B1: { bg: "bg-blue-100", text: "text-blue-700" },
  B2: { bg: "bg-indigo-100", text: "text-indigo-700" },
  C1: { bg: "bg-purple-100", text: "text-purple-700" },
  C2: { bg: "bg-red-100", text: "text-red-700" },
};

export function getCategoryConfig(category: string) {
  return (
    categoryConfig[category] || {
      label: category,
      color: "text-gray-700",
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: "📄",
    }
  );
}
