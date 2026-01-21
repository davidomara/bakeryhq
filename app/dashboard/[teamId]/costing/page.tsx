import { listProductCostings } from "@/app/dashboard/[teamId]/costing/actions";
import { CostingPageClient } from "@/app/dashboard/[teamId]/costing/page-client";

export default async function ProductCostingPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const costings = await listProductCostings(teamId);

  const serialized = costings.map((costing) => ({
    id: costing.id,
    name: costing.name,
    notes: costing.notes,
    yieldUnits: costing.yieldUnits,
    yieldUnitLabel: costing.yieldUnitLabel,
    laborHours: costing.laborHours ? Number(costing.laborHours) : null,
    laborRateUGXPerHour: costing.laborRateUGXPerHour,
    overheadMode: costing.overheadMode,
    overheadValue: costing.overheadValue,
    markupBps: costing.markupBps,
    targetProfitUGX: costing.targetProfitUGX,
    targetMarginBps: costing.targetMarginBps,
    pricingMode: costing.pricingMode,
    userSellingPriceUGX: costing.userSellingPriceUGX,
    ingredientLines: costing.ingredientLines.map((line) => ({
      id: line.id,
      name: line.name,
      qty: Number(line.qty),
      unit: line.unit,
      unitCostUGX: line.unitCostUGX,
    })),
    packagingLines: costing.packagingLines.map((line) => ({
      id: line.id,
      name: line.name,
      costUGX: line.costUGX,
    })),
  }));

  return <CostingPageClient teamId={teamId} initialCostings={serialized} />;
}
