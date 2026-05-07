import { Queue } from "bullmq";
import { connection } from "@/lib/redis";

export type ReviewJobData = {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  installationId: number;
  repoId: string;
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
