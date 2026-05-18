import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft, GitPullRequest, Clock, FileCode,
  ShieldAlert, AlertTriangle, Lightbulb,
  CheckCircle2, ExternalLink, User, GitBranch,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { RerunButton } from "@/components/rerun-button";

const SEVERITY = {
  CRITICAL: {
    label: "Critical",
    icon: <ShieldAlert className="h-3 w-3" />,
    pill: "bg-red-500/10 text-red-300 border-red-500/30",
    dot: "bg-red-400",
    row: "border-red-500/10",
  },
  WARNING: {
    label: "Warning",
    icon: <AlertTriangle className="h-3 w-3" />,
    pill: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
    row: "border-yellow-500/10",
  },
  SUGGESTION: {
    label: "Suggestion",
    icon: <Lightbulb className="h-3 w-3" />,
    pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    row: "border-emerald-500/10",
  },
};

const STATUS_PILL: Record<string, string> = {
  COMPLETED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  FAILED: "bg-red-500/10 text-red-300 border-red-500/30",
  IN_PROGRESS: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  PENDING: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
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

  const byFile = review.issues.reduce<Record<string, typeof review.issues>>(
    (acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    },
    {}
  );

  const critical = review.issues.filter((i) => i.severity === "CRITICAL").length;
  const warnings = review.issues.filter((i) => i.severity === "WARNING").length;
  const suggestions = review.issues.filter((i) => i.severity === "SUGGESTION").length;
  const prUrl = `https://github.com/${review.repo.repoOwner}/${review.repo.repoName}/pull/${review.prNumber}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Reviews
      </Link>

      {/* Breadcrumb */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[12px] text-zinc-500 flex-wrap">
          <GitPullRequest className="h-3.5 w-3.5" />
          <span>{review.repo.repoOwner}/{review.repo.repoName}</span>
          <span className="text-zinc-700">·</span>
          <span>#{review.prNumber}</span>
          {review.prBranch && (
            <>
              <span className="text-zinc-700">·</span>
              <GitBranch className="h-3.5 w-3.5" />
              <span>{review.prBranch}</span>
            </>
          )}
          <span className="text-zinc-700">·</span>
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(review.createdAt))}</span>
        </div>

        <h1 className="text-xl font-semibold text-zinc-100 leading-snug">{review.prTitle}</h1>

        {/* Action row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${STATUS_PILL[review.status] ?? STATUS_PILL.PENDING}`}>
            {review.status.replace("_", " ")}
          </span>
          {critical > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-red-500/10 text-red-300 border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{critical} critical
            </span>
          )}
          {warnings > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{warnings} warnings
            </span>
          )}
          {suggestions > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{suggestions} suggestions
            </span>
          )}
          <div className="flex-1" />
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 cursor-pointer text-zinc-300 text-sm transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on GitHub
          </a>
          <RerunButton reviewId={review.id} />
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px rounded-[14px] border border-[#1f1f23] overflow-hidden bg-[#1f1f23]">
        {[
          { label: "Author", value: review.prAuthor ?? review.repo.repoOwner, icon: <User className="h-3.5 w-3.5" /> },
          { label: "Files changed", value: Object.keys(byFile).length.toString(), icon: <FileCode className="h-3.5 w-3.5" /> },
          { label: "Issues", value: review.issues.length.toString(), icon: <ShieldAlert className="h-3.5 w-3.5" /> },
          { label: "Time", value: formatDistanceToNow(new Date(review.createdAt)), icon: <Clock className="h-3.5 w-3.5" /> },
          { label: "Reviewed by", value: "Llama 3.3 70B", icon: <GitPullRequest className="h-3.5 w-3.5" /> },
        ].map((m) => (
          <div key={m.label} className="flex flex-col gap-1 px-4 py-3 bg-[#0f0f12]">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              {m.icon}
              {m.label}
            </div>
            <p className="font-mono text-sm text-zinc-200">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {review.issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-zinc-100 font-semibold text-lg">All clean.</p>
          <p className="text-zinc-500 text-sm max-w-xs">
            No issues found in this PR. The code looks good!
          </p>
        </div>
      ) : (
        /* Issues by file */
        <div className="flex flex-col gap-4">
          {Object.entries(byFile).map(([file, issues]) => {
            const fCritical = issues.filter((i) => i.severity === "CRITICAL").length;
            const fWarnings = issues.filter((i) => i.severity === "WARNING").length;
            const fSuggestions = issues.filter((i) => i.severity === "SUGGESTION").length;

            return (
              <div key={file} className="rounded-[14px] border border-[#1f1f23] overflow-hidden">
                {/* File header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#111114] border-b border-[#1f1f23]">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 text-zinc-500" />
                    <code className="font-mono text-[12px] text-violet-300">{file}</code>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {fCritical > 0 && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
                        {fCritical} critical
                      </span>
                    )}
                    {fWarnings > 0 && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                        {fWarnings} warnings
                      </span>
                    )}
                    {fSuggestions > 0 && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {fSuggestions} suggestions
                      </span>
                    )}
                  </div>
                </div>

                {/* Issue rows */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 divide-y divide-[#1f1f23]">
                  {issues.map((issue) => {
                    const s = SEVERITY[issue.severity];
                    return (
                      <div key={issue.id} className="px-4 py-4 flex flex-col gap-3">
                        {/* Severity + line */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${s.pill}`}>
                            {s.icon}
                            {s.label}
                          </span>
                          {issue.line && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-[#27272a]">
                              line {issue.line}
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-sm text-zinc-200 leading-relaxed">{issue.message}</p>

                        {/* Suggested fix */}
                        {issue.suggestion && (
                          <div className="border-l-2 border-violet-500 pl-3 py-2 bg-gradient-to-r from-violet-500/[.06] to-transparent rounded-r-lg">
                            <p className="font-mono text-[10px] uppercase tracking-[.08em] text-violet-300 mb-1.5">
                              Suggested Fix
                            </p>
                            <p className="font-mono text-[12px] text-zinc-300 italic leading-relaxed">
                              {issue.suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
