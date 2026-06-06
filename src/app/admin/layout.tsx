import { redirect } from "next/navigation";
import { getAppProfile, getServerUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getServerUser();
  if (!authUser) {
    redirect("/login");
  }

  const profile = await getAppProfile(authUser.id);
  if (!profile || profile.isBanned) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return <DashboardShell variant="admin">{children}</DashboardShell>;
}
