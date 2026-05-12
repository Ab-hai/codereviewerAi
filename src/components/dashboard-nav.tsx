"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GitPullRequest, LogOut } from "lucide-react";
import type { DefaultSession } from "next-auth";

type Props = {
  user: DefaultSession["user"] & { id: string };
};

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Reviews" },
    { href: "/dashboard/repos", label: "Repos" },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f23] bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-[1100px] mx-auto px-7 h-full flex items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.4)]">
            <GitPullRequest className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-zinc-100">CodeReviewer AI</span>
        </Link>

        {/* Nav pills */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 border border-[#27272a] text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white select-none"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          title={user?.name ?? ""}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? ""} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
