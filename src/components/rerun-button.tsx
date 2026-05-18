"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

export function RerunButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRerun = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/rerun`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        alert(data.error ?? "Failed to re-run review");
        return;
      }
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRerun}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-zinc-300 text-sm transition-colors"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5" />
      )}
      {loading ? "Re-running…" : "Re-run"}
    </button>
  );
}
