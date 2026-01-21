"use server";

import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";
import {
  computeIngredientLineCostUGX,
  computeLaborCostUGX,
  computeProductTotals,
  computeRecommendedPriceUGX,
} from "@/lib/costing/calculations";
import { productCostingInputSchema } from "@/lib/costing/schema";

const unitToPrisma = {
  g: "G",
  kg: "KG",
  ml: "ML",
  l: "L",
  pcs: "PCS",
} as const;

export async function listProductCostings(teamId: string) {
  await requireTeamContext(teamId);

  return prisma.productCosting.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    include: {
      ingredientLines: true,
      packagingLines: true,
    },
  });
}

export async function upsertProductCosting(teamId: string, rawInput: unknown) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);
  const input = productCostingInputSchema.parse(rawInput);

  const ingredientLines = input.ingredients.map((line) => ({
    name: line.name,
    qty: line.qty,
    unit: unitToPrisma[line.unit],
    unitCostUGX: line.unitCostUGX,
    lineCostUGX: computeIngredientLineCostUGX(line),
  }));

  const packagingLines = input.packaging.map((line) => ({
    name: line.name,
    costUGX: line.costUGX,
  }));

  const laborCostUGX = computeLaborCostUGX({
    hours: input.laborHours ?? 0,
    rateUGXPerHour: input.laborRateUGXPerHour ?? 0,
  });

  const totals = computeProductTotals({
    ingredients: input.ingredients,
    packaging: input.packaging,
    labor: {
      hours: input.laborHours ?? 0,
      rateUGXPerHour: input.laborRateUGXPerHour ?? 0,
    },
    overhead: input.overhead,
    yieldUnits: input.yieldUnits ?? null,
  });

  const pricing = computeRecommendedPriceUGX(
    totals.totalCostUGX,
    input.pricing.markupBps ?? null,
    input.pricing.targetProfitUGX ?? null,
    input.pricing.targetMarginBps ?? null
  );

  const data = {
    teamId: resolvedTeamId,
    name: input.name,
    notes: input.notes ?? null,
    yieldUnits: input.yieldUnits ?? null,
    yieldUnitLabel: input.yieldUnitLabel ?? null,
    laborHours: input.laborHours ?? null,
    laborRateUGXPerHour: input.laborRateUGXPerHour ?? null,
    laborCostUGX,
    overheadMode: input.overhead.mode === "flatUGX" ? "FLAT_UGX" : "PERCENT_OF_SUBTOTAL",
    overheadValue: input.overhead.value,
    subtotalUGX: totals.subtotalUGX,
    overheadUGX: totals.overheadUGX,
    totalCostUGX: totals.totalCostUGX,
    costPerUnitUGX: totals.costPerUnitUGX,
    markupBps: input.pricing.markupBps ?? null,
    targetProfitUGX: input.pricing.targetProfitUGX ?? null,
    targetMarginBps: input.pricing.targetMarginBps ?? null,
    pricingMode: input.pricingMode ?? "AUTO_RECOMMENDED",
    autoRecommendedPriceUGX: pricing.autoRecommendedPriceUGX,
    userSellingPriceUGX: input.pricing.userSellingPriceUGX ?? null,
  } as const;

  if (input.id) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.productCosting.findFirst({
        where: { id: input.id, teamId: resolvedTeamId },
      });
      if (!existing) {
        throw new Error("Costing not found.");
      }

      await tx.ingredientLine.deleteMany({ where: { productCostingId: input.id } });
      await tx.packagingLine.deleteMany({ where: { productCostingId: input.id } });

      return tx.productCosting.update({
        where: { id: input.id },
        data: {
          ...data,
          ingredientLines: {
            create: ingredientLines,
          },
          packagingLines: {
            create: packagingLines,
          },
        },
        include: { ingredientLines: true, packagingLines: true },
      });
    });
  }

  return prisma.productCosting.create({
    data: {
      ...data,
      ingredientLines: {
        create: ingredientLines,
      },
      packagingLines: {
        create: packagingLines,
      },
    },
    include: { ingredientLines: true, packagingLines: true },
  });
}

export async function duplicateProductCosting(teamId: string, productCostingId: string) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);

  const existing = await prisma.productCosting.findFirst({
    where: { id: productCostingId, teamId: resolvedTeamId },
    include: { ingredientLines: true, packagingLines: true },
  });

  if (!existing) {
    throw new Error("Costing not found.");
  }

  return prisma.productCosting.create({
    data: {
      teamId: resolvedTeamId,
      name: `${existing.name} (Copy)`,
      notes: existing.notes,
      yieldUnits: existing.yieldUnits,
      yieldUnitLabel: existing.yieldUnitLabel,
      laborHours: existing.laborHours,
      laborRateUGXPerHour: existing.laborRateUGXPerHour,
      laborCostUGX: existing.laborCostUGX,
      overheadMode: existing.overheadMode,
      overheadValue: existing.overheadValue,
      subtotalUGX: existing.subtotalUGX,
      overheadUGX: existing.overheadUGX,
      totalCostUGX: existing.totalCostUGX,
      costPerUnitUGX: existing.costPerUnitUGX,
      markupBps: existing.markupBps,
      targetProfitUGX: existing.targetProfitUGX,
      targetMarginBps: existing.targetMarginBps,
      pricingMode: existing.pricingMode,
      autoRecommendedPriceUGX: existing.autoRecommendedPriceUGX,
      userSellingPriceUGX: existing.userSellingPriceUGX,
      ingredientLines: {
        create: existing.ingredientLines.map((line) => ({
          name: line.name,
          qty: line.qty,
          unit: line.unit,
          unitCostUGX: line.unitCostUGX,
          lineCostUGX: line.lineCostUGX,
        })),
      },
      packagingLines: {
        create: existing.packagingLines.map((line) => ({
          name: line.name,
          costUGX: line.costUGX,
        })),
      },
    },
    include: { ingredientLines: true, packagingLines: true },
  });
}
