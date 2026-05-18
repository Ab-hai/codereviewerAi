"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GitPullRequest, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-[#09090b] overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid grid-fade pointer-events-none" />
      <div className="relative z-10 w-full max-w-[400px] mx-4">
        <div className="rounded-[14px] border border-[#27272a] bg-gradient-to-b from-[#131316] to-[#18181b] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          {/* Logo tile */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(124,58,237,0.5)]">
              <GitPullRequest className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center font-semibold text-xl text-zinc-50 mb-1">
            Welcome back
          </h1>
          <p className="text-center text-sm text-zinc-400 mb-8">
            Sign in to your CodeReviewer AI account
          </p>

          {/* GitHub button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white font-medium text-sm transition-all btn-glow"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            {loading ? "Signing in…" : "Sign in with GitHub"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1f1f23]" />
            <span className="font-mono text-[11px] text-zinc-600">or</span>
            <div className="flex-1 h-px bg-[#1f1f23]" />
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] text-zinc-600 leading-relaxed">
            By signing in you agree to our{" "}
            <a href="#" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}
