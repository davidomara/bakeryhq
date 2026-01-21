import { SalesPageClient } from "@/app/dashboard/[teamId]/sales/page-client";
import { listProductCostingOptions, listSalesData } from "@/app/dashboard/[teamId]/sales/actions";

export default async function SalesPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const [products, data] = await Promise.all([
    listProductCostingOptions(teamId),
    listSalesData(teamId, {}),
  ]);

  return <SalesPageClient teamId={teamId} products={products} initialData={data} />;
}
