import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { reviewQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

async function verifySignature(
  secret: string,
  body: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const valid = await verifySignature(secret, body, signature);

  if (!valid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Handle GitHub App installation events ──────────────────────────────────
  // When a user installs the app on a repo, auto-add it to our DB
  if (event === "installation" || event === "installation_repositories") {
    const action = payload.action as string;
    const installation = payload.installation as Record<string, unknown>;
    const installationId = installation.id as number;
    const sender = payload.sender as Record<string, unknown>;
    const senderLogin = sender.login as string;

    const repos =
      action === "created"
        ? (payload.repositories as Array<{ name: string; full_name: string }>)
        : (payload.repositories_added as Array<{ name: string; full_name: string }>);

    if (repos?.length) {
      // Find the user in our DB by GitHub username
      const user = await prisma.user.findFirst({
        where: { accounts: { some: { providerAccountId: String(installation.app_id ?? senderLogin) } } },
      });

      for (const repo of repos) {
        const [repoOwner, repoName] = repo.full_name.split("/");
        await prisma.repo.upsert({
          where: { repoOwner_repoName: { repoOwner, repoName } },
          create: {
            repoOwner,
            repoName,
            webhookId: installationId,
            active: true,
            userId: user?.id ?? "",
          },
          update: { active: true, webhookId: installationId },
        });
      }
    }

    return Response.json({ ok: true });
  }

  // ── Handle pull_request events ─────────────────────────────────────────────
  if (event !== "pull_request") {
    return Response.json({ ok: true, skipped: true });
  }

  const action = payload.action as string;
  if (action !== "opened" && action !== "synchronize") {
    return Response.json({ ok: true, skipped: true });
  }

  const pr = payload.pull_request as Record<string, unknown>;
  const repository = payload.repository as Record<string, unknown>;
  const installation = payload.installation as Record<string, unknown>;

  const repoOwner = (repository.owner as Record<string, unknown>).login as string;
  const repoName = repository.name as string;
  const prNumber = pr.number as number;
  const prTitle = pr.title as string;
  const prAuthor = (pr.user as Record<string, unknown>).login as string;
  const prBranch = (pr.head as Record<string, unknown>).ref as string;
  const installationId = installation.id as number;

  const repo = await prisma.repo.findUnique({
    where: { repoOwner_repoName: { repoOwner, repoName } },
  });

  if (!repo || !repo.active) {
    return Response.json({ ok: true, skipped: true });
  }

  const review = await prisma.review.create({
    data: { repoId: repo.id, prNumber, prTitle, prAuthor, prBranch, status: "PENDING" },
  });

  await reviewQueue.add(
    `review:${repoOwner}/${repoName}#${prNumber}`,
    { repoOwner, repoName, prNumber, prTitle, installationId, repoId: repo.id },
    { jobId: `review-${review.id}` }
  );

  return Response.json({ ok: true, reviewId: review.id });
}
