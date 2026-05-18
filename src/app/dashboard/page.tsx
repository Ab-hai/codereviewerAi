import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManualTrigger } from "@/components/manual-trigger";
import { ReviewsList } from "@/components/reviews-list";

export default async function DashboardPage() {
  const session = await auth();

  const reviews = await prisma.review.findMany({
    where: { repo: { userId: session!.user.id } },
    include: { repo: true, issues: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Reviews</h1>
          <p className="font-mono text-[12px] text-zinc-500 mt-0.5">{reviews.length} total</p>
        </div>
        <ManualTrigger />
      </div>

      {/* Tabs + list — client component, instant filtering */}
      <ReviewsList reviews={reviews} />
    </div>
  );
}
