import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Find or create the user record in our database
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split("@")[0],
        role: "STUDENT",
      },
    });
  }

  switch (dbUser.role) {
    case "ADMIN":
      redirect("/admin");
    case "MANAGER":
      redirect("/manager");
    case "TEACHER":
      redirect("/teacher");
    case "STUDENT":
      redirect("/student");
    default:
      redirect("/login");
  }
}
