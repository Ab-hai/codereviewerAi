import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewQueue } from "@/lib/queue";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Find the review and verify it belongs to this user
  const review = await prisma.review.findFirst({
    where: { id, repo: { userId: session.user.id } },
    include: { repo: true },
  });

  if (!review) {
    return Response.json({ error: "Review not found" }, { status: 404 });
  }

  if (!review.repo.webhookId) {
    return Response.json(
      { error: "No GitHub App installation found for this repo" },
      { status: 400 }
    );
  }

  // Delete old issues and reset status to PENDING
  await prisma.reviewIssue.deleteMany({ where: { reviewId: review.id } });
  await prisma.review.update({
    where: { id: review.id },
    data: { status: "PENDING" },
  });

  // Queue the job — pass reviewId so the worker targets this exact record
  await reviewQueue.add(
    `rerun:${review.repo.repoOwner}/${review.repo.repoName}#${review.prNumber}`,
    {
      repoOwner: review.repo.repoOwner,
      repoName: review.repo.repoName,
      prNumber: review.prNumber,
      prTitle: review.prTitle,
      prAuthor: review.prAuthor ?? undefined,
      prBranch: review.prBranch ?? undefined,
      installationId: review.repo.webhookId,
      repoId: review.repoId,
      reviewId: review.id,
    }
  );

  return Response.json({ ok: true });
}
