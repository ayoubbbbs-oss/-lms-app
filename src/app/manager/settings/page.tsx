import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, User, Mail, Shield } from "lucide-react";

export default async function ManagerSettings() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "MANAGER") redirect("/");

  return (
    <DashboardLayout role="MANAGER" userName={dbUser.name}>
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Settings</h1>
        <p className="text-xs text-slate-500">Your profile and preferences</p>
      </div>
      <div className="p-4 max-w-lg">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {dbUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{dbUser.name}</p>
              <p className="text-xs text-slate-500">Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm"><User size={14} className="text-slate-400" /><span className="text-slate-600">{dbUser.name}</span></div>
          <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-slate-400" /><span className="text-slate-600">{dbUser.email}</span></div>
          <div className="flex items-center gap-2 text-sm"><Shield size={14} className="text-slate-400" /><span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">MANAGER</span></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
