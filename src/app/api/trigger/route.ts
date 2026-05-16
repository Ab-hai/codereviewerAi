import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewQueue } from "@/lib/queue";
import { getInstallationOctokit } from "@/lib/github";

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

  if (!repoRecord.webhookId) {
    return Response.json(
      { error: "No GitHub App installation found for this repo." },
      { status: 400 }
    );
  }

  // Fetch real PR details via GitHub App installation auth
  let prTitle = `PR #${prNumber}`;
  let prAuthor: string | undefined;
  let prBranch: string | undefined;

  try {
    const octokit = getInstallationOctokit(repoRecord.webhookId);
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    prTitle = pr.title;
    prAuthor = pr.user?.login ?? undefined;
    prBranch = pr.head.ref;
  } catch {
    // Non-fatal: proceed with placeholder title if GitHub fetch fails
    console.warn(`[trigger] Could not fetch PR details for ${owner}/${repo}#${prNumber}`);
  }

  // Create review record
  const review = await prisma.review.create({
    data: {
      repoId: repoRecord.id,
      prNumber,
      prTitle,
      prAuthor,
      prBranch,
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
      prAuthor,
      prBranch,
      installationId: repoRecord.webhookId,
      repoId: repoRecord.id,
      reviewId: review.id,
    },
    { jobId: `review-${review.id}` }
  );

  return Response.json({ ok: true, reviewId: review.id });
}
