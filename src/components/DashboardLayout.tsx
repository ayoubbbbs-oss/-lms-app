"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({
  role,
  userName,
  children,
}: {
  role: string;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} userName={userName} />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
