import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, User, Mail, Shield } from "lucide-react";

export default async function TeacherSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN")) redirect("/");

  return (
    <DashboardLayout role="TEACHER" userName={dbUser.name}>
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your profile information
        </p>
      </div>

      <div className="px-8 py-6 max-w-2xl">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          {/* Avatar + name header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {dbUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {dbUser.name}
              </p>
              <p className="text-xs text-slate-400">Teacher Account</p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4 pt-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <User size={12} />
                Full Name
              </label>
              <input
                type="text"
                defaultValue={dbUser.name}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Mail size={12} />
                Email Address
              </label>
              <input
                type="email"
                defaultValue={dbUser.email}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Shield size={12} />
                Role
              </label>
              <input
                type="text"
                defaultValue={dbUser.role}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Account created{" "}
                {new Date(dbUser.createdAt).toLocaleDateString()}. Contact an
                administrator to update your profile details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
