import { WeddingCakesPageClient } from "@/app/dashboard/[teamId]/wedding-cakes/page-client";
import { listProductCostingOptions, listWeddingCostings } from "@/app/dashboard/[teamId]/wedding-cakes/actions";

export default async function WeddingCakesPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const [costings, productOptions] = await Promise.all([
    listWeddingCostings(teamId),
    listProductCostingOptions(teamId),
  ]);

  const serialized = costings.map((costing) => ({
    id: costing.id,
    clientName: costing.clientName,
    eventDate: costing.eventDate ? costing.eventDate.toISOString().slice(0, 10) : null,
    notes: costing.notes,
    markupBps: costing.markupBps,
    targetProfitUGX: costing.targetProfitUGX,
    targetMarginBps: costing.targetMarginBps,
    userSellingPriceUGX: costing.userSellingPriceUGX,
    tiers: costing.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      servings: tier.servings,
      flavor: tier.flavor,
      linkedProductCostingId: tier.linkedProductCostingId,
      manualTierCostUGX: tier.manualTierCostUGX,
    })),
    extras: costing.extras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      costUGX: extra.costUGX,
    })),
  }));

  return (
    <WeddingCakesPageClient
      teamId={teamId}
      initialCostings={serialized}
      productOptions={productOptions}
    />
  );
}
