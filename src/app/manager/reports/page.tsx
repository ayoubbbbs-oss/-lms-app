import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function ManagerReports() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "MANAGER" && dbUser.role !== "ADMIN")) redirect("/");

  const assignments = await prisma.assignment.findMany({ select: { status: true } });
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter((a) => a.status === "IN_PROGRESS").length;
  const notStarted = assignments.filter((a) => a.status === "NOT_STARTED").length;
  const rate = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;

  return (
    <DashboardLayout role="MANAGER" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Reports</h1>
        <p className="text-xs text-slate-500">Platform performance overview</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total", value: assignments.length, icon: <BarChart3 size={18} className="text-blue-600" />, bg: "bg-blue-50" },
            { label: "Completed", value: completed, icon: <CheckCircle2 size={18} className="text-green-600" />, bg: "bg-green-50" },
            { label: "In Progress", value: inProgress, icon: <Clock size={18} className="text-amber-600" />, bg: "bg-amber-50" },
            { label: "Not Started", value: notStarted, icon: <AlertCircle size={18} className="text-slate-500" />, bg: "bg-slate-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Completion Rate</h2>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full transition-all flex items-center justify-center" style={{ width: `${rate}%` }}>
              <span className="text-[10px] font-bold text-white">{rate}%</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
