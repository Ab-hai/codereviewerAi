import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, ExternalLink, GitPullRequest } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

const AVATAR_GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-red-600",
  "from-pink-600 to-rose-600",
];

export default async function ReposPage() {
  const session = await auth();

  const repos = await prisma.repo.findMany({
    where: { userId: session!.user.id },
    include: {
      _count: { select: { reviews: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const appName = process.env.GITHUB_APP_NAME ?? "your-app";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Connected Repos</h1>
          <p className="font-mono text-[12px] text-zinc-500 mt-0.5">{repos.length} repos</p>
        </div>
        <a
          href={`https://github.com/apps/${appName}/installations/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Manage on GitHub
        </a>
      </div>

      {/* Install instructions card */}
      <div className="rounded-[14px] border border-violet-500/20 bg-gradient-to-b from-violet-500/[.06] to-violet-500/[.02] p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-zinc-100 mb-1">How to connect a repo</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Install the GitHub App on any repo — AI reviews start immediately on new PRs.
            </p>
            <ol className="flex flex-col gap-2">
              {[
                <>Install the GitHub App: <a href={`https://github.com/apps/${appName}/installations/new`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">Click here →</a></>,
                "Select the repos you want to enable AI reviews on",
                "Open any Pull Request — the review will appear automatically as a comment",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="shrink-0 w-5 h-5 rounded bg-zinc-800 border border-[#27272a] flex items-center justify-center font-mono text-[11px] text-zinc-400 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Repos list */}
      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-[14px] border border-[#1f1f23] bg-zinc-900 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="text-zinc-300 font-medium">No repos connected yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Follow the instructions above to install the GitHub App on your repos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {repos.map((repo, i) => {
            const gradClass = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const lastReview = repo.reviews[0];
            return (
              <div
                key={repo.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-[14px] border border-[#1f1f23] bg-gradient-to-b from-zinc-900 to-zinc-950 hover:border-zinc-700 transition-all"
              >
                {/* Gradient avatar */}
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradClass} flex items-center justify-center text-white font-mono font-bold text-sm shrink-0`}>
                  {repo.repoName[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-zinc-100">
                    <span className="text-zinc-500">{repo.repoOwner}</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    {repo.repoName}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                      <GitPullRequest className="h-3 w-3" />
                      {repo._count.reviews} reviews
                    </span>
                    {lastReview && (
                      <span className="font-mono text-[11px] text-zinc-600">
                        Last: {formatDistanceToNow(new Date(lastReview.createdAt))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active pill */}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${
                  repo.active
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${repo.active ? "bg-emerald-400" : "bg-zinc-500"}`} />
                  {repo.active ? "Active" : "Inactive"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
