import { Worker } from "bullmq";
import { connection } from "@/lib/redis";
import type { ReviewJobData } from "@/lib/queue";

const worker = new Worker<ReviewJobData>(
  "pr-review",
  async (job) => {
    const { repoOwner, repoName, prNumber, installationId, repoId } = job.data;

    console.log(
      `[worker] Processing PR #${prNumber} for ${repoOwner}/${repoName}`
    );

    // TODO Day 2: fetch diff, run AI review, post GitHub comment
    // Steps:
    // 1. Authenticate as GitHub App installation (installationId)
    // 2. Fetch PR diff from GitHub API
    // 3. Parse diff file-by-file, filter lock/generated files
    // 4. Send each file chunk to AI, collect issues
    // 5. Post consolidated review comment on the PR
    // 6. Update review status in DB (COMPLETED / FAILED)

    void repoId; // used in Day 2 DB updates
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
