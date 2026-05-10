import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GitPullRequest } from "lucide-react";

export default async function ReposPage() {
  const session = await auth();

  const repos = await prisma.repo.findMany({
    where: { userId: session!.user.id },
    include: { _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Connected Repos</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Repos where the GitHub App is installed and active
          </p>
        </div>
      </div>

      {/* Install instructions */}
      <Card className="bg-zinc-900 border-zinc-800 p-5">
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-violet-400" />
            How to connect a repo
          </h2>
          <ol className="flex flex-col gap-2 text-sm text-zinc-400 list-decimal list-inside">
            <li>
              Install the GitHub App on your repo:{" "}
              <a
                href={`https://github.com/apps/${process.env.GITHUB_APP_NAME ?? "your-app"}/installations/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                Click here to install →
              </a>
            </li>
            <li>Select the repos you want to enable AI reviews on</li>
            <li>Open any Pull Request — the review will appear automatically</li>
          </ol>
        </div>
      </Card>

      {/* Repos list */}
      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <BookOpen className="h-12 w-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">No repos connected yet</p>
          <p className="text-zinc-600 text-sm max-w-xs">
            Follow the instructions above to install the GitHub App on your repos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {repos.map((repo) => (
            <Card key={repo.id} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-zinc-100">
                    {repo.repoOwner}/{repo.repoName}
                  </p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <GitPullRequest className="h-3 w-3" />
                    {repo._count.reviews} reviews
                  </p>
                </div>
                <Badge
                  className={
                    repo.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }
                >
                  {repo.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
