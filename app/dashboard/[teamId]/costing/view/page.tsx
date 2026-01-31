import { listProductCostings } from "@/app/dashboard/[teamId]/costing/actions";
import { CostingListPageClient } from "@/app/dashboard/[teamId]/costing/view/page-client";

export default async function CostingListPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const costings = await listProductCostings(teamId);

  return <CostingListPageClient teamId={teamId} costings={costings} />;
}
