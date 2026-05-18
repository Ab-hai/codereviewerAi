"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Zap, Loader2, ShieldCheck } from "lucide-react";
import { GitPullRequest } from "lucide-react";

export function ManualTrigger() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl: url }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to trigger review");
      setUrl("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 cursor-pointer text-white text-sm font-medium transition-all btn-glow"
      >
        <Zap className="h-3.5 w-3.5" />
        Trigger Review
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#131316] border border-[#27272a] text-zinc-50 rounded-[14px] max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#1f1f23]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <GitPullRequest className="h-4 w-4 text-violet-400" />
              </div>
              <DialogTitle className="text-base font-semibold text-zinc-100">
                Trigger a Review
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            <p className="text-sm text-zinc-400">
              Paste a GitHub PR URL to run an AI review on demand. The repo must be connected first.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[.08em] text-zinc-500">
                Pull Request URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="w-full bg-[#111114] border border-[#27272a] rounded-lg px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all"
                required
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#111114] border border-[#1f1f23]">
              <ShieldCheck className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Reviews are processed securely. Your code is never stored — only the diff is sent to the AI for analysis.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 cursor-pointer text-zinc-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-medium transition-all btn-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {loading ? "Running…" : "Run review"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
