import { listProductCostings } from "@/app/dashboard/[teamId]/costing/actions";
import { CostingPageClient } from "@/app/dashboard/[teamId]/costing/page-client";

type IngredientUnit = "g" | "kg" | "ml" | "l" | "pcs";

function toIngredientUnit(unit: string): IngredientUnit {
  switch (unit) {
    case "g":
    case "kg":
    case "ml":
    case "l":
    case "pcs":
      return unit;
    default:
      return "pcs";
  }
}

export default async function ProductCostingPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const costings = await listProductCostings(teamId);
  const normalized = costings.map((costing) => ({
    ...costing,
    ingredientLines: costing.ingredientLines.map((line) => ({
      ...line,
      unit: toIngredientUnit(line.unit),
    })),
  }));

  return <CostingPageClient teamId={teamId} initialCostings={normalized} />;
}
