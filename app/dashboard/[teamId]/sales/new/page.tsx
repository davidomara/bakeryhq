import { listProductCostingOptions } from "@/app/dashboard/[teamId]/sales/actions";
import { SalesNewPageClient } from "@/app/dashboard/[teamId]/sales/new/page-client";

export default async function SalesNewPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const products = await listProductCostingOptions(teamId);

  return <SalesNewPageClient teamId={teamId} products={products} />;
}
