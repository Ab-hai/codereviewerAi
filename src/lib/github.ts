import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

// Authenticate as a GitHub App installation
// Each repo that installs our app gets a unique installationId
export const getInstallationOctokit = (installationId: number): Octokit => {
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n");

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID!,
      privateKey,
      installationId,
    },
  });
};

// Fetch the raw unified diff for a PR
export const fetchPRDiff = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> => {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: { format: "diff" },
  });

  return response.data as unknown as string;
};

// Post a review comment on the PR
export const postPRComment = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
): Promise<void> => {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });
};
