import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewQueue } from "@/lib/queue";

// Parse a GitHub PR URL into its parts
// e.g. https://github.com/owner/repo/pull/123
const parsePRUrl = (url: string): { owner: string; repo: string; prNumber: number } | null => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], prNumber: parseInt(match[3], 10) };
};

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { prUrl?: string };
  if (!body.prUrl) return Response.json({ error: "prUrl is required" }, { status: 400 });

  const parsed = parsePRUrl(body.prUrl);
  if (!parsed) {
    return Response.json(
      { error: "Invalid GitHub PR URL. Expected: https://github.com/owner/repo/pull/123" },
      { status: 400 }
    );
  }

  const { owner, repo, prNumber } = parsed;

  // Check the repo exists in our DB and belongs to this user
  const repoRecord = await prisma.repo.findFirst({
    where: {
      repoOwner: owner,
      repoName: repo,
      userId: session.user.id,
      active: true,
    },
  });

  if (!repoRecord) {
    return Response.json(
      { error: "Repo not connected. Install the GitHub App on this repo first." },
      { status: 404 }
    );
  }

  // Fetch PR title from GitHub
  const ghRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    { headers: { Authorization: `Bearer ${process.env.GITHUB_APP_PRIVATE_KEY}`, "X-GitHub-Api-Version": "2022-11-28" } }
  );
  const prTitle = ghRes.ok
    ? ((await ghRes.json()) as { title: string }).title
    : `PR #${prNumber}`;

  // Create review record
  const review = await prisma.review.create({
    data: {
      repoId: repoRecord.id,
      prNumber,
      prTitle,
      status: "PENDING",
    },
  });

  // Queue the job
  await reviewQueue.add(
    `review:${owner}/${repo}#${prNumber}`,
    {
      repoOwner: owner,
      repoName: repo,
      prNumber,
      prTitle,
      installationId: repoRecord.webhookId ?? 0,
      repoId: repoRecord.id,
    },
    { jobId: `review-${review.id}` }
  );

  return Response.json({ ok: true, reviewId: review.id });
}
