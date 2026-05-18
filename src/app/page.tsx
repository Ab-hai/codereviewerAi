"use client";

import { signIn } from "next-auth/react";
import { GitPullRequest, Zap, ShieldCheck, MessageSquareCode } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-50 overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-6 backdrop-blur-md bg-[#09090b]/60 border-b border-[#1f1f23]">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.5)]">
              <GitPullRequest className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-zinc-100">CodeReviewer AI</span>
            <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">beta</span>
          </div>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="text-sm px-4 py-1.5 rounded-lg border border-[#27272a] bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer transition-colors"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid grid-fade pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <p className="font-mono text-[11px] uppercase tracking-[.1em] text-violet-400">— AI-powered code review</p>

          {/* Headline */}
          <h1 className="font-sans font-semibold text-zinc-50 leading-[1.02] tracking-[-0.035em]"
            style={{ fontSize: "clamp(40px,6vw,76px)" }}>
            Every PR reviewed{" "}
            <span className="font-serif italic text-violet-300">before</span>
            {" "}it ships
          </h1>

          <p className="text-zinc-400 text-lg max-w-lg leading-relaxed">
            Install once. AI reviews every Pull Request you open — catching bugs, security issues, and bad patterns as a comment on GitHub.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 cursor-pointer text-white font-medium text-sm transition-all btn-glow"
            >
              <GithubIcon />
              Continue with GitHub
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 cursor-pointer text-zinc-300 hover:text-zinc-100 font-medium text-sm transition-colors">
              View live demo
            </button>
          </div>

          {/* Trust pills */}
          <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-zinc-500">
            <span>99.9% uptime</span>
            <span className="text-zinc-700">·</span>
            <span>SOC2 compliant</span>
            <span className="text-zinc-700">·</span>
            <span>500+ repos reviewed</span>
          </div>
        </div>

        {/* ── Faux PR Preview ── */}
        <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto text-left">
          <div className="rounded-[14px] border border-[#27272a] bg-gradient-to-b from-[#131316] to-[#18181b] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f23] bg-[#111114]">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-4 font-mono text-[11px] text-zinc-500 bg-[#09090b] px-3 py-1 rounded-md border border-[#1f1f23] flex-1 max-w-xs">
                github.com/abhay/api-service/pull/42
              </span>
            </div>
            {/* 2-col body */}
            <div className="grid grid-cols-2 divide-x divide-[#1f1f23]">
              {/* Code column */}
              <div className="font-mono text-[12px] p-0 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#1f1f23] text-zinc-500 text-[11px]">auth.ts</div>
                {[
                  { n: 40, code: "export async function login(", hi: false },
                  { n: 41, code: "  email: string,", hi: false },
                  { n: 42, code: "  password: string", hi: false },
                  { n: 43, code: ") {", hi: false },
                  { n: 44, code: `  const query = \`SELECT *`, hi: true },
                  { n: 45, code: `    FROM users WHERE`, hi: true },
                  { n: 46, code: `    email = '\${email}'\``, hi: true },
                  { n: 47, code: "  return db.run(query)", hi: false },
                  { n: 48, code: "}", hi: false },
                ].map((line) => (
                  <div
                    key={line.n}
                    className={`flex ${line.hi ? "bg-red-500/[.08]" : ""}`}
                  >
                    <span className="w-10 shrink-0 text-right pr-3 py-0.5 text-zinc-600 border-r border-[#1f1f23] select-none">{line.n}</span>
                    <span className={`pl-3 py-0.5 ${line.hi ? "text-red-300" : "text-zinc-300"}`}>{line.code}</span>
                  </div>
                ))}
              </div>
              {/* Issue column */}
              <div className="p-4 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border bg-red-500/10 text-red-300 border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Critical
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">line 44–46</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  SQL injection vulnerability. User input is directly interpolated into the query string without sanitization.
                </p>
                {/* Suggested fix block */}
                <div className="border-l-2 border-violet-500 pl-3 bg-gradient-to-r from-violet-500/[.06] to-transparent rounded-r-lg py-2">
                  <p className="font-mono text-[10px] uppercase tracking-[.08em] text-violet-300 mb-1">Suggested Fix</p>
                  <p className="font-mono text-[11px] text-zinc-300 italic">
                    Use parameterized queries: db.run(`SELECT * FROM users WHERE email = ?`, [email])
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-[120px] px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[.1em] text-violet-400">— What it does</p>
            <h2 className="font-sans font-semibold text-zinc-50 leading-[1.05] tracking-[-0.025em]"
              style={{ fontSize: "clamp(32px,4vw,48px)" }}>
              Your AI reviewer, <span className="font-serif italic text-violet-300">actually</span> useful
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              {
                icon: <Zap className="h-5 w-5 text-violet-400" />,
                title: "Instant Reviews",
                desc: "AI review posted within seconds of opening a PR. No waiting, no manual triggers.",
                m1: "Avg latency", v1: "~8s",
                m2: "Models", v2: "Llama 3.3 70B",
              },
              {
                icon: <ShieldCheck className="h-5 w-5 text-violet-400" />,
                title: "Security Focused",
                desc: "Detects SQLi, XSS, hardcoded secrets, insecure dependencies, and more.",
                m1: "Issue types", v1: "40+",
                m2: "Severity levels", v2: "3",
              },
              {
                icon: <MessageSquareCode className="h-5 w-5 text-violet-400" />,
                title: "Inline Comments",
                desc: "Feedback appears directly on GitHub like a human reviewer — with line references.",
                m1: "Integrates with", v1: "GitHub",
                m2: "Setup time", v2: "< 60s",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-4 p-5 rounded-[14px] border border-[#1f1f23] bg-gradient-to-b from-zinc-900 to-zinc-950 hover:border-zinc-700 hover:-translate-y-px transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
                <div className="border-t border-[#1f1f23] pt-3 mt-auto grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-zinc-600 tracking-wider">{f.m1}</p>
                    <p className="font-mono text-sm text-zinc-200 mt-0.5">{f.v1}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase text-zinc-600 tracking-wider">{f.m2}</p>
                    <p className="font-mono text-sm text-zinc-200 mt-0.5">{f.v2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-[120px] px-6 border-t border-[#1f1f23]">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[.1em] text-violet-400">— How it works</p>
            <h2 className="font-sans font-semibold text-zinc-50 leading-[1.05] tracking-[-0.025em]"
              style={{ fontSize: "clamp(32px,4vw,48px)" }}>
              Up and running in <span className="font-serif italic text-violet-300">60 seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              { n: "01", label: "Install", body: "Install the GitHub App on any repo. Takes 30 seconds. No code changes required." },
              { n: "02", label: "Open a PR", body: "Push your branch and open a Pull Request like you normally would." },
              { n: "03", label: "Get reviewed", body: "AI reviews the diff and posts structured feedback with severity levels directly on the PR." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative flex flex-col gap-4 p-5 rounded-[14px] border border-[#1f1f23] bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden"
              >
                {/* Giant faded number */}
                <span className="absolute top-2 right-4 font-mono font-bold text-[72px] leading-none text-violet-500/[.07] select-none pointer-events-none">
                  {s.n}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[.1em] text-violet-400">Step {s.n}</p>
                <h3 className="font-semibold text-zinc-100 text-lg">{s.label}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 cursor-pointer text-white font-medium text-sm transition-all btn-glow"
          >
            <GithubIcon />
            Get started free
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1f1f23] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
              <GitPullRequest className="h-3 w-3 text-white" />
            </div>
            <span className="font-mono text-[11px] text-zinc-600">© 2026 CodeReviewer AI</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] text-zinc-600">
            <a href="#" className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 cursor-pointer transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-400 cursor-pointer transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
