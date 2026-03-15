import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserCheck, BarChart3, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function ManagerDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "MANAGER") redirect("/");

  const [teacherCount, studentCount, lessonCount, assignmentCount] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.lesson.count(),
    prisma.assignment.count(),
  ]);

  const stats = [
    { label: "Teachers", value: teacherCount, icon: <UserCheck size={18} className="text-blue-600" />, bg: "bg-blue-50", href: "/manager/teachers" },
    { label: "Students", value: studentCount, icon: <Users size={18} className="text-green-600" />, bg: "bg-green-50", href: "/manager/students" },
    { label: "Lessons", value: lessonCount, icon: <BookOpen size={18} className="text-purple-600" />, bg: "bg-purple-50", href: "/manager/reports" },
    { label: "Assignments", value: assignmentCount, icon: <BarChart3 size={18} className="text-orange-600" />, bg: "bg-orange-50", href: "/manager/reports" },
  ];

  return (
    <DashboardLayout role="MANAGER" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Manager Dashboard</h1>
        <p className="text-xs text-slate-500">Overview of your organization</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3 shadow-sm hover:shadow transition-shadow">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
