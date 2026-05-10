"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest, Zap, ShieldCheck, MessageSquareCode } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Hero */}
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          Powered by Groq · Llama 3.3 70B
        </Badge>

        <h1 className="text-5xl font-bold tracking-tight text-zinc-50 leading-tight">
          AI Code Reviews
          <br />
          <span className="text-violet-400">on every PR</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-md">
          Install once. Every Pull Request you open gets automatically reviewed
          by AI — bugs, security issues, and suggestions posted as a comment.
        </p>

        <Button
          size="lg"
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-base rounded-xl"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full px-4">
        {[
          {
            icon: <Zap className="h-5 w-5 text-violet-400" />,
            title: "Instant Reviews",
            desc: "AI review posted within seconds of opening a PR",
          },
          {
            icon: <ShieldCheck className="h-5 w-5 text-violet-400" />,
            title: "Security Focused",
            desc: "Catches vulnerabilities, bugs, and bad patterns",
          },
          {
            icon: <MessageSquareCode className="h-5 w-5 text-violet-400" />,
            title: "Inline Comments",
            desc: "Feedback appears directly on GitHub like a real reviewer",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-zinc-800 bg-zinc-900"
          >
            {f.icon}
            <h3 className="font-semibold text-zinc-100">{f.title}</h3>
            <p className="text-sm text-zinc-400 text-center">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-20 max-w-xl w-full px-4">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-8">
          How it works
        </h2>
        <div className="flex flex-col gap-4 text-left">
          {[
            { step: "1", text: "Sign in and install the GitHub App on your repo" },
            { step: "2", text: "Open a Pull Request like you normally would" },
            { step: "3", text: "AI reviews the diff and posts structured feedback" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <p className="text-zinc-300 pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-20 text-zinc-600 text-sm flex items-center gap-2">
        <GitPullRequest className="h-4 w-4" />
        Works with any GitHub repository
      </p>
    </main>
  );
}
