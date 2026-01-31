"use server";

import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";
import { computeRecommendedPriceUGX } from "@/lib/costing/calculations";
import { weddingCostingInputSchema } from "@/lib/costing/schema";

export async function listWeddingCostings(teamId: string) {
  await requireTeamContext(teamId);
  const costings = await prisma.weddingCosting.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      clientName: true,
      eventDate: true,
      notes: true,
      markupBps: true,
      targetProfitUGX: true,
      targetMarginBps: true,
      userSellingPriceUGX: true,
      tiers: {
        select: {
          id: true,
          weddingCostingId: true,
          name: true,
          servings: true,
          flavor: true,
          linkedProductCostingId: true,
          manualTierCostUGX: true,
          tierCostSnapshotUGX: true,
        },
      },
      extras: {
        select: {
          id: true,
          weddingCostingId: true,
          name: true,
          costUGX: true,
        },
      },
    },
  });

  return costings.map((costing) => ({
    ...costing,
    eventDate: costing.eventDate ? costing.eventDate.toISOString().slice(0, 10) : null,
  }));
}

export async function listProductCostingOptions(teamId: string) {
  await requireTeamContext(teamId);
  return prisma.productCosting.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      totalCostUGX: true,
      costPerUnitUGX: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertWeddingCosting(teamId: string, rawInput: unknown) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);
  const input = weddingCostingInputSchema.parse(rawInput);

  const productCostingIds = input.tiers
    .map((tier) => tier.linkedProductCostingId)
    .filter((id): id is string => Boolean(id));

  const productCostings = await prisma.productCosting.findMany({
    where: { teamId: resolvedTeamId, id: { in: productCostingIds } },
    select: { id: true, totalCostUGX: true },
  });

  const productCostingMap = new Map(
    productCostings.map((costing) => [costing.id, costing.totalCostUGX])
  );

  const tiers = input.tiers.map((tier) => {
    const linkedCost = tier.linkedProductCostingId
      ? productCostingMap.get(tier.linkedProductCostingId) ?? null
      : null;
    const manualCost = tier.manualTierCostUGX ?? null;
    const tierCost = linkedCost ?? manualCost ?? 0;

    return {
      name: tier.name,
      servings: tier.servings ?? null,
      flavor: tier.flavor ?? null,
      linkedProductCostingId: tier.linkedProductCostingId ?? null,
      tierCostSnapshotUGX: linkedCost,
      manualTierCostUGX: linkedCost ? null : manualCost,
      computedCostUGX: tierCost,
    };
  });

  const extras = input.extras.map((extra) => ({
    name: extra.name,
    costUGX: extra.costUGX,
  }));

  const tiersTotal = tiers.reduce((sum, tier) => sum + tier.computedCostUGX, 0);
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.costUGX, 0);
  const totalCostUGX = tiersTotal + extrasTotal;

  const totalServings = tiers.reduce(
    (sum, tier) => sum + (tier.servings ?? 0),
    0
  );
  const costPerServingUGX = totalServings > 0 ? Math.round(totalCostUGX / totalServings) : null;

  const pricing = computeRecommendedPriceUGX(
    totalCostUGX,
    input.pricing.markupBps ?? null,
    input.pricing.targetProfitUGX ?? null,
    input.pricing.targetMarginBps ?? null
  );

  const data = {
    teamId: resolvedTeamId,
    clientName: input.clientName ?? null,
    eventDate: input.eventDate ? new Date(input.eventDate) : null,
    notes: input.notes ?? null,
    totalCostUGX,
    costPerServingUGX,
    markupBps: input.pricing.markupBps ?? null,
    targetProfitUGX: input.pricing.targetProfitUGX ?? null,
    targetMarginBps: input.pricing.targetMarginBps ?? null,
    autoRecommendedPriceUGX: pricing.autoRecommendedPriceUGX,
    userSellingPriceUGX: input.pricing.userSellingPriceUGX ?? null,
  } as const;

  if (input.id) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.weddingCosting.findFirst({
        where: { id: input.id, teamId: resolvedTeamId },
      });
      if (!existing) {
        throw new Error("Wedding costing not found.");
      }

      await tx.weddingTier.deleteMany({ where: { weddingCostingId: input.id } });
      await tx.weddingExtra.deleteMany({ where: { weddingCostingId: input.id } });

      return tx.weddingCosting.update({
        where: { id: input.id },
        data: {
          ...data,
          tiers: {
            create: tiers.map((tier) => ({
              name: tier.name,
              servings: tier.servings,
              flavor: tier.flavor,
              linkedProductCostingId: tier.linkedProductCostingId,
              tierCostSnapshotUGX: tier.tierCostSnapshotUGX,
              manualTierCostUGX: tier.manualTierCostUGX,
            })),
          },
          extras: {
            create: extras,
          },
        },
        include: { tiers: true, extras: true },
      });
    });
  }

  return prisma.weddingCosting.create({
    data: {
      ...data,
      tiers: {
        create: tiers.map((tier) => ({
          name: tier.name,
          servings: tier.servings,
          flavor: tier.flavor,
          linkedProductCostingId: tier.linkedProductCostingId,
          tierCostSnapshotUGX: tier.tierCostSnapshotUGX,
          manualTierCostUGX: tier.manualTierCostUGX,
        })),
      },
      extras: {
        create: extras,
      },
    },
    include: { tiers: true, extras: true },
  });
}
