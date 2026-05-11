import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManualTrigger } from "@/components/manual-trigger";
import Link from "next/link";
import { GitPullRequest, ChevronRight, Clock, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  COMPLETED: "bg-emerald-400",
  FAILED: "bg-red-400",
  IN_PROGRESS: "bg-blue-400 pulse-dot",
  PENDING: "bg-zinc-500",
};

const STATUS_PILL: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  FAILED: "bg-red-500/10 text-red-300 border-red-500/30",
  IN_PROGRESS: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  PENDING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Completed",
  FAILED: "Failed",
  IN_PROGRESS: "In Progress",
  PENDING: "Pending",
};

export default async function DashboardPage() {
  const session = await auth();

  const reviews = await prisma.review.findMany({
    where: { repo: { userId: session!.user.id } },
    include: { repo: true, issues: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const counts = {
    all: reviews.length,
    in_progress: reviews.filter((r) => r.status === "IN_PROGRESS").length,
    completed: reviews.filter((r) => r.status === "COMPLETED").length,
    failed: reviews.filter((r) => r.status === "FAILED").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Reviews</h1>
          <p className="font-mono text-[12px] text-zinc-500 mt-0.5">{counts.all} total</p>
        </div>
        <ManualTrigger />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-0">
        {[
          { label: "All", count: counts.all },
          { label: "In Progress", count: counts.in_progress },
          { label: "Completed", count: counts.completed },
          { label: "Failed", count: counts.failed },
        ].map((tab, i) => (
          <div
            key={tab.label}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm cursor-default border-b-2 -mb-px transition-colors ${
              i === 0
                ? "border-violet-500 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
              {tab.count}
            </span>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-[14px] border border-[#1f1f23] bg-zinc-900 flex items-center justify-center">
            <GitPullRequest className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="text-zinc-300 font-medium">No reviews yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Connect a repo and open a Pull Request — the AI review will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => {
            const critical = review.issues.filter((i) => i.severity === "CRITICAL").length;
            const warnings = review.issues.filter((i) => i.severity === "WARNING").length;
            const suggestions = review.issues.filter((i) => i.severity === "SUGGESTION").length;
            const dotClass = STATUS_DOT[review.status] ?? STATUS_DOT.PENDING;
            const pillClass = STATUS_PILL[review.status] ?? STATUS_PILL.PENDING;

            return (
              <Link key={review.id} href={`/dashboard/reviews/${review.id}`}>
                <div className="group flex items-center gap-4 px-4 py-3.5 rounded-[14px] border border-[#1f1f23] bg-gradient-to-b from-zinc-900 to-zinc-950 hover:border-zinc-700 hover:-translate-y-px transition-all cursor-pointer">
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Meta line */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                        <GitPullRequest className="h-3 w-3" />
                        {review.repo.repoOwner}/{review.repo.repoName}
                        <span className="text-zinc-700">·</span>
                        #{review.prNumber}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-600 flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        main
                      </span>
                    </div>
                    {/* Title */}
                    <p className="text-sm font-medium text-zinc-200 truncate">{review.prTitle}</p>
                    {/* Sub meta */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] text-zinc-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(review.createdAt))}
                      </span>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="flex items-center gap-2 shrink-0">
                    {review.status === "COMPLETED" && review.issues.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {critical > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-red-500/10 text-red-300 border-red-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {critical}
                          </span>
                        )}
                        {warnings > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            {warnings}
                          </span>
                        )}
                        {suggestions > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {suggestions}
                          </span>
                        )}
                      </div>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${pillClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      {STATUS_LABEL[review.status]}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
