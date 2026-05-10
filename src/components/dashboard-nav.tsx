"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GitPullRequest, BookOpen, LogOut } from "lucide-react";
import type { DefaultSession } from "next-auth";

type Props = {
  user: DefaultSession["user"] & { id: string };
};

export function DashboardNav({ user }: Props) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Reviews", icon: <GitPullRequest className="h-4 w-4" /> },
    { href: "/dashboard/repos", label: "Repos", icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="font-semibold text-zinc-100 flex items-center gap-2">
          <GitPullRequest className="h-5 w-5 text-violet-400" />
          CodeReviewer AI
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? ""} />
            <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
