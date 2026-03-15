import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { UserCheck, Mail, Users } from "lucide-react";

export default async function ManagerTeachers() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "MANAGER" && dbUser.role !== "ADMIN")) redirect("/");

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: "asc" },
    include: { teacherStudents: { include: { student: { select: { name: true } } } } },
  });

  return (
    <DashboardLayout role="MANAGER" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Teachers</h1>
        <p className="text-xs text-slate-500">{teachers.length} teacher{teachers.length !== 1 ? "s" : ""} registered</p>
      </div>
      <div className="p-4">
        {teachers.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <UserCheck size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No teachers registered yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Name</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Email</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs">Students</th>
              </tr></thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-4 font-medium text-slate-800">{t.name}</td>
                    <td className="py-2 px-4 text-slate-500 flex items-center gap-1"><Mail size={12} />{t.email}</td>
                    <td className="py-2 px-4"><span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{t.teacherStudents.length}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
