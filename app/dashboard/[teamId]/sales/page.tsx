import { SalesPageClient } from "@/app/dashboard/[teamId]/sales/page-client";
import { listProductCostingOptions, listSalesData } from "@/app/dashboard/[teamId]/sales/actions";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [products, data] = await Promise.all([
    listProductCostingOptions(teamId),
    listSalesData(teamId, {}),
  ]);

  return <SalesPageClient teamId={teamId} products={products} initialData={data} />;
}
