import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentSettingsClient from "./StudentSettingsClient";

export default async function StudentSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || (dbUser.role !== "STUDENT" && dbUser.role !== "ADMIN")) redirect("/");

  return (
    <StudentSettingsClient
      userName={dbUser.name}
      userEmail={dbUser.email}
      userRole={dbUser.role}
      createdAt={dbUser.createdAt.toISOString()}
    />
  );
}
