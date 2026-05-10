"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="relative">
      <Button
        size="sm"
        className="bg-violet-600 hover:bg-violet-700"
        onClick={() => setOpen(!open)}
      >
        <Zap className="h-4 w-4 mr-1.5" />
        Trigger Review
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-20 bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-80 shadow-xl">
          <p className="text-sm font-medium text-zinc-100 mb-1">Manual PR Review</p>
          <p className="text-xs text-zinc-400 mb-3">
            Paste a GitHub PR URL to trigger an AI review
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              required
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Zap className="h-4 w-4 mr-1.5" />
              )}
              {loading ? "Triggering..." : "Run Review"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
