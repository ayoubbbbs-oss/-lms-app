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
  ClipboardList,
  FileText,
} from "lucide-react";
import { logout } from "@/app/login/actions";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const S = 16; // icon size — compact

const roleNavItems: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={S} /> },
    { label: "Users", href: "/admin/users", icon: <Users size={S} /> },
    { label: "Library", href: "/admin/library", icon: <BookOpen size={S} /> },
    { label: "Students", href: "/admin/students", icon: <GraduationCap size={S} /> },
    { label: "Teachers", href: "/admin/teachers", icon: <UserCheck size={S} /> },
    { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={S} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={S} /> },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/manager", icon: <LayoutDashboard size={S} /> },
    { label: "Teachers", href: "/manager/teachers", icon: <UserCheck size={S} /> },
    { label: "Students", href: "/manager/students", icon: <Users size={S} /> },
    { label: "Reports", href: "/manager/reports", icon: <BarChart3 size={S} /> },
    { label: "Settings", href: "/manager/settings", icon: <Settings size={S} /> },
  ],
  TEACHER: [
    { label: "Dashboard", href: "/teacher", icon: <LayoutDashboard size={S} /> },
    { label: "Classroom", href: "/teacher/classroom", icon: <Radio size={S} /> },
    { label: "Library", href: "/teacher/library", icon: <BookOpen size={S} /> },
    { label: "Students", href: "/teacher/students", icon: <Users size={S} /> },
    { label: "Homework", href: "/teacher/homework", icon: <ClipboardList size={S} /> },
    { label: "Settings", href: "/teacher/settings", icon: <Settings size={S} /> },
  ],
  STUDENT: [
    { label: "My Lessons", href: "/student", icon: <BookOpen size={S} /> },
    { label: "Homework", href: "/student/homework", icon: <ClipboardList size={S} /> },
    { label: "Progress", href: "/student/progress", icon: <BarChart3 size={S} /> },
    { label: "Settings", href: "/student/settings", icon: <Settings size={S} /> },
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
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-slate-800 text-white flex flex-col z-50">
      {/* Logo — compact */}
      <div className="px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Off2Lougha</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation — compact */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role.toLowerCase()}` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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

      {/* User — compact */}
      <div className="border-t border-slate-700 px-3 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full">
            <LogOut size={14} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
