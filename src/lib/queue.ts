import { Queue } from "bullmq";
import { connection } from "@/lib/redis";

export type ReviewJobData = {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  prAuthor?: string;
  prBranch?: string;
  installationId: number;
  repoId: string;
  reviewId?: string; // set on rerun so worker targets the exact review record
};

export const reviewQueue = new Queue<ReviewJobData>("pr-review", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
