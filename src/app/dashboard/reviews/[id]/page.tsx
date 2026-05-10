import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileCode, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    icon: <ShieldAlert className="h-4 w-4" />,
    class: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  WARNING: {
    label: "Warning",
    icon: <AlertTriangle className="h-4 w-4" />,
    class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  SUGGESTION: {
    label: "Suggestion",
    icon: <Lightbulb className="h-4 w-4" />,
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const review = await prisma.review.findFirst({
    where: { id, repo: { userId: session!.user.id } },
    include: { repo: true, issues: { orderBy: { severity: "asc" } } },
  });

  if (!review) notFound();

  // Group issues by file
  const byFile = review.issues.reduce<
    Record<string, typeof review.issues>
  >((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {});

  const critical = review.issues.filter((i) => i.severity === "CRITICAL").length;
  const warnings = review.issues.filter((i) => i.severity === "WARNING").length;
  const suggestions = review.issues.filter((i) => i.severity === "SUGGESTION").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reviews
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500">
          {review.repo.repoOwner}/{review.repo.repoName} · PR #{review.prNumber} ·{" "}
          {formatDistanceToNow(new Date(review.createdAt))}
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">{review.prTitle}</h1>

        {/* Summary badges */}
        <div className="flex items-center gap-2 mt-1">
          {critical > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {critical} critical
            </span>
          )}
          {warnings > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              {warnings} warnings
            </span>
          )}
          {suggestions > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {suggestions} suggestions
            </span>
          )}
          {review.issues.length === 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ No issues found
            </span>
          )}
        </div>
      </div>

      {/* Issues by file */}
      {Object.entries(byFile).map(([file, issues]) => (
        <div key={file} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <FileCode className="h-4 w-4 text-zinc-500" />
            <code className="text-violet-300">{file}</code>
          </div>

          {issues.map((issue) => {
            const config = SEVERITY_CONFIG[issue.severity];
            return (
              <Card key={issue.id} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${config.class}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    {issue.line && (
                      <span className="text-xs text-zinc-500 mt-0.5">Line {issue.line}</span>
                    )}
                  </div>
                  <p className="text-zinc-200 text-sm">{issue.message}</p>
                  {issue.suggestion && (
                    <div className="mt-1 pl-3 border-l-2 border-violet-500/30">
                      <p className="text-xs text-zinc-400">
                        <span className="text-violet-400 font-medium">Suggestion: </span>
                        {issue.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
