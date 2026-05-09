import "dotenv/config";
import { Worker } from "bullmq";
import { connection } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit, fetchPRDiff, postPRComment } from "@/lib/github";
import { parseDiff } from "@/lib/diff-parser";
import { reviewDiff } from "@/lib/ai-review";
import { formatReviewComment } from "@/lib/format-comment";
import type { ReviewJobData } from "@/lib/queue";

const worker = new Worker<ReviewJobData>(
  "pr-review",
  async (job) => {
    const { repoOwner, repoName, prNumber, prTitle, installationId, repoId } =
      job.data;

    console.log(`[worker] Starting review for ${repoOwner}/${repoName}#${prNumber}`);

    // Find the pending review record for this job
    const review = await prisma.review.findFirst({
      where: { repoId, prNumber, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (!review) {
      console.warn("[worker] No pending review found, skipping");
      return;
    }

    // Mark as in-progress
    await prisma.review.update({
      where: { id: review.id },
      data: { status: "IN_PROGRESS" },
    });

    try {
      // Step 1: Authenticate as the GitHub App installation
      const octokit = getInstallationOctokit(installationId);

      // Step 2: Fetch the raw PR diff
      console.log(`[worker] Fetching diff for PR #${prNumber}`);
      const rawDiff = await fetchPRDiff(octokit, repoOwner, repoName, prNumber);

      // Step 3: Parse diff into per-file chunks, skip lock/generated files
      const files = parseDiff(rawDiff);
      console.log(`[worker] Parsed ${files.length} reviewable files`);

      if (files.length === 0) {
        const comment = formatReviewComment([], prTitle);
        await postPRComment(octokit, repoOwner, repoName, prNumber, comment);
        await prisma.review.update({
          where: { id: review.id },
          data: { status: "COMPLETED" },
        });
        return;
      }

      // Step 4: Send each file to the AI, collect issues
      console.log("[worker] Running AI review...");
      const issues = await reviewDiff(files);
      console.log(`[worker] AI found ${issues.length} issues`);

      // Step 5: Save issues to DB
      if (issues.length > 0) {
        await prisma.reviewIssue.createMany({
          data: issues.map((issue) => ({
            reviewId: review.id,
            file: issue.file,
            line: issue.line,
            severity: issue.severity,
            message: issue.message,
            suggestion: issue.suggestion,
          })),
        });
      }

      // Step 6: Format and post the comment on the PR
      const comment = formatReviewComment(issues, prTitle);
      await postPRComment(octokit, repoOwner, repoName, prNumber, comment);
      console.log("[worker] Posted review comment on PR");

      // Step 7: Mark review as completed
      await prisma.review.update({
        where: { id: review.id },
        data: { status: "COMPLETED" },
      });

      console.log(`[worker] ✅ Review completed for PR #${prNumber}`);
    } catch (err) {
      console.error("[worker] Review failed:", err);

      // Mark as failed so the dashboard can show the error state
      await prisma.review.update({
        where: { id: review.id },
        data: { status: "FAILED" },
      });

      // Re-throw so BullMQ triggers the retry logic
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

export default worker;
