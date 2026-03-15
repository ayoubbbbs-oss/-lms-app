"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function StudentSettingsClient({
  userName,
  userEmail,
  userRole,
  createdAt,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  createdAt: string;
}) {
  return (
    <DashboardLayout role="STUDENT" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your account information
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Avatar + Name */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{userName}</h2>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                <Shield size={10} />
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
              <User size={16} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Full Name</p>
              <p className="text-sm text-slate-700 font-medium">{userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-sm text-slate-700 font-medium">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Role</p>
              <p className="text-sm text-slate-700 font-medium">{userRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Member Since</p>
              <p className="text-sm text-slate-700 font-medium">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Contact your administrator to update your account details.
        </p>
      </div>
    </DashboardLayout>
  );
}
