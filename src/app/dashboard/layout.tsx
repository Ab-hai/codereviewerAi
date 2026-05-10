import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav user={session.user} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
