import { listProductCostings } from "@/app/dashboard/[teamId]/costing/actions";
import { CostingPageClient } from "@/app/dashboard/[teamId]/costing/page-client";

export default async function ProductCostingPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const costings = await listProductCostings(teamId);

  return <CostingPageClient teamId={teamId} initialCostings={costings} />;
}
