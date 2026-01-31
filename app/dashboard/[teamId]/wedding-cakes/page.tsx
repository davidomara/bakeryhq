import { WeddingCakesPageClient } from "@/app/dashboard/[teamId]/wedding-cakes/page-client";
import { listProductCostingOptions, listWeddingCostings } from "@/app/dashboard/[teamId]/wedding-cakes/actions";

export default async function WeddingCakesPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [costings, productOptions] = await Promise.all([
    listWeddingCostings(teamId),
    listProductCostingOptions(teamId),
  ]);

  return (
    <WeddingCakesPageClient
      teamId={teamId}
      initialCostings={costings}
      productOptions={productOptions}
    />
  );
}
