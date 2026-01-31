import { listWeddingCostings } from "@/app/dashboard/[teamId]/wedding-cakes/actions";
import { WeddingCostingListPageClient } from "@/app/dashboard/[teamId]/wedding-cakes/view/page-client";

export default async function WeddingCostingListPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const costings = await listWeddingCostings(teamId);

  return <WeddingCostingListPageClient teamId={teamId} costings={costings} />;
}
