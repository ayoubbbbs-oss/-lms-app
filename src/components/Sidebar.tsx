"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  LogOut,
  Settings,
  BarChart3,
  Radio,
} from "lucide-react";
import { logout } from "@/app/login/actions";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const roleNavItems: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Library", href: "/admin/library", icon: <BookOpen size={20} /> },
    { label: "Students", href: "/admin/students", icon: <Users size={20} /> },
    { label: "Teachers", href: "/admin/teachers", icon: <UserCheck size={20} /> },
    { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={20} /> },
  ],
  TEACHER: [
    { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard size={20} /> },
    { label: "Classroom", href: "/teacher/classroom", icon: <Radio size={20} /> },
    { label: "My Students", href: "/teacher/students", icon: <Users size={20} /> },
  ],
  STUDENT: [
    { label: "My Lessons", href: "/student", icon: <BookOpen size={20} /> },
    { label: "Progress", href: "/student/progress", icon: <BarChart3 size={20} /> },
  ],
};

export default function Sidebar({
  role,
  userName,
}: {
  role: string;
  userName: string;
}) {
  const pathname = usePathname();
  const navItems = roleNavItems[role] || [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">LMS Portal</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role.toLowerCase()}` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">
              {role.toLowerCase()}
            </p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors w-full">
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
