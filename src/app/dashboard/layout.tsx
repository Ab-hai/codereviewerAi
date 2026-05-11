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
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <DashboardNav user={session.user} />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-7 py-8">
        {children}
      </main>
    </div>
  );
}
