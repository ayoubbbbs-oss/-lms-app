"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  Search,
  Mail,
} from "lucide-react";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const roleBadge: Record<string, { bg: string; text: string; ring: string }> = {
  ADMIN: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  MANAGER: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
  },
  TEACHER: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  STUDENT: {
    bg: "bg-green-100",
    text: "text-green-700",
    ring: "ring-green-200",
  },
};

const roleIcon: Record<string, React.ReactNode> = {
  ADMIN: <Shield size={16} className="text-purple-600" />,
  MANAGER: <Shield size={16} className="text-indigo-600" />,
  TEACHER: <UserCheck size={16} className="text-blue-600" />,
  STUDENT: <GraduationCap size={16} className="text-green-600" />,
};

export default function AdminUsersClient({
  userName,
  users,
}: {
  userName: string;
  users: UserRecord[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const admins = users.filter((u) => u.role === "ADMIN");
  const teachers = users.filter((u) => u.role === "TEACHER");
  const students = users.filter((u) => u.role === "STUDENT");
  const managers = users.filter((u) => u.role === "MANAGER");

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <DashboardLayout role="ADMIN" userName={userName}>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {users.length} user{users.length !== 1 ? "s" : ""} registered on the
          platform
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: <Users size={18} className="text-slate-600" />,
              label: "Total Users",
              value: users.length,
              bg: "bg-slate-50",
            },
            {
              icon: <Shield size={18} className="text-purple-600" />,
              label: "Admins",
              value: admins.length,
              bg: "bg-purple-50",
            },
            {
              icon: <UserCheck size={18} className="text-blue-600" />,
              label: "Teachers",
              value: teachers.length,
              bg: "bg-blue-50",
            },
            {
              icon: <GraduationCap size={18} className="text-green-600" />,
              label: "Students",
              value: students.length,
              bg: "bg-green-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Role Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: null, label: "All" },
                { key: "ADMIN", label: "Admin" },
                { key: "TEACHER", label: "Teacher" },
                { key: "STUDENT", label: "Student" },
                ...(managers.length > 0
                  ? [{ key: "MANAGER", label: "Manager" }]
                  : []),
              ].map((f) => (
                <button
                  key={f.key || "all"}
                  onClick={() => setRoleFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    roleFilter === f.key
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-medium">No users found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    User
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Email
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Role
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-400 text-xs">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const badge = roleBadge[u.role] || roleBadge.STUDENT;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-slate-500 flex items-center gap-1 text-sm">
                          <Mail size={12} className="text-slate-400" />
                          {u.email}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-0.5 rounded-full`}
                        >
                          {roleIcon[u.role]}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
