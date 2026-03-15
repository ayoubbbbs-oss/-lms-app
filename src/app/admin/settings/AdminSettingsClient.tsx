"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  Globe,
  Mail,
  Info,
  Server,
  Database,
} from "lucide-react";

export default function AdminSettingsClient({
  userName,
  adminEmail,
}: {
  userName: string;
  adminEmail: string;
}) {
  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configuration and system information
        </p>
      </div>

      <div className="px-8 py-6 max-w-2xl">
        {/* Platform Info */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Platform
        </h2>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 mb-6">
          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">
                Platform Name
              </p>
              <p className="text-sm text-slate-700 font-medium">
                LMS Learning Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Admin Email</p>
              <p className="text-sm text-slate-700 font-medium">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <Info size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Version</p>
              <p className="text-sm text-slate-700 font-medium">1.0.0</p>
            </div>
          </div>
        </div>

        {/* System Info */}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          System
        </h2>
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 mb-6">
          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Server size={16} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Framework</p>
              <p className="text-sm text-slate-700 font-medium">
                Next.js (App Router)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
              <Database size={16} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Database</p>
              <p className="text-sm text-slate-700 font-medium">
                PostgreSQL (Prisma ORM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">
                Authentication
              </p>
              <p className="text-sm text-slate-700 font-medium">
                Supabase Auth
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Settings on this page are read-only. Update environment variables to
          change configuration.
        </p>
      </div>
    </DashboardLayout>
  );
}
