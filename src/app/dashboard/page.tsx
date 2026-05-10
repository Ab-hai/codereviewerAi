import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ManualTrigger } from "@/components/manual-trigger";
import Link from "next/link";
import { GitPullRequest, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

const STATUS_CONFIG = {
  COMPLETED: { label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  FAILED: { label: "Failed", icon: <XCircle className="h-3.5 w-3.5" />, class: "bg-red-500/10 text-red-400 border-red-500/20" },
  IN_PROGRESS: { label: "In Progress", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  PENDING: { label: "Pending", icon: <Clock className="h-3.5 w-3.5" />, class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

export default async function DashboardPage() {
  const session = await auth();

  const reviews = await prisma.review.findMany({
    where: { repo: { userId: session!.user.id } },
    include: {
      repo: true,
      issues: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Reviews</h1>
          <p className="text-sm text-zinc-400 mt-1">All AI reviews across your connected repos</p>
        </div>
        <ManualTrigger />
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <GitPullRequest className="h-12 w-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">No reviews yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Connect a repo and open a Pull Request — the AI review will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const status = STATUS_CONFIG[review.status];
            const critical = review.issues.filter((i) => i.severity === "CRITICAL").length;
            const warnings = review.issues.filter((i) => i.severity === "WARNING").length;
            const suggestions = review.issues.filter((i) => i.severity === "SUGGESTION").length;

            return (
              <Link key={review.id} href={`/dashboard/reviews/${review.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors p-4 cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {review.repo.repoOwner}/{review.repo.repoName} #{review.prNumber}
                        </span>
                      </div>
                      <p className="text-zinc-100 font-medium truncate">{review.prTitle}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(review.createdAt))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {review.status === "COMPLETED" && review.issues.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {critical > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              {critical} critical
                            </span>
                          )}
                          {warnings > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              {warnings} warnings
                            </span>
                          )}
                          {suggestions > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {suggestions} suggestions
                            </span>
                          )}
                        </div>
                      )}
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
