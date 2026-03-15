import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Mail, CheckCircle2 } from "lucide-react";

export default async function ManagerStudents() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "MANAGER") redirect("/");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    include: { studentAssignments: { select: { status: true } } },
  });

  return (
    <DashboardLayout role="MANAGER" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Students</h1>
        <p className="text-xs text-slate-500">{students.length} student{students.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Name</th>
              <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Email</th>
              <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Lessons</th>
              <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Completed</th>
            </tr></thead>
            <tbody>
              {students.map((s) => {
                const completed = s.studentAssignments.filter((a) => a.status === "COMPLETED").length;
                return (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-4 font-medium text-slate-800">{s.name}</td>
                    <td className="py-2 px-4 text-slate-500 flex items-center gap-1"><Mail size={12} />{s.email}</td>
                    <td className="py-2 px-4 text-slate-600">{s.studentAssignments.length}</td>
                    <td className="py-2 px-4"><span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 size={11} />{completed}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
