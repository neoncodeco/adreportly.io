import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    await requireMongo();
  } catch {
    redirect("/dashboard");
  }

  const row = (await UserModel.findById(session.user.id).select("role").lean().exec()) as {
    role?: string | null;
  } | null;

  if (row?.role !== "admin") {
    redirect("/dashboard");
  }

  return <DashboardShell variant="admin">{children}</DashboardShell>;
}
