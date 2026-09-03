import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, requireRole, signOut } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { DashboardToaster } from "@/components/dashboard/toaster";

async function signOutAction() {
  "use server";
  // Clear the session without Auth.js building an absolute URL from AUTH_URL
  // (that env is still localhost on some deploys and sends users off-site).
  await signOut({ redirect: false });
  redirect("/login");
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  // Layout gate — every page still calls requireRole() for its own roles.
  await requireRole();

  return (
    <div className="flex min-h-screen bg-paper text-bark">
      <DashboardSidebar role={session.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          userName={session.user.name ?? "User"}
          userEmail={session.user.email ?? ""}
          userRole={session.user.role}
          signOutAction={signOutAction}
        />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
      <DashboardToaster />
    </div>
  );
}
