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

  const costings = await prisma.productCosting.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
    include: {
      ingredientLines: true,
      packagingLines: true,
    },
  });

  return costings.map((costing) => serializeProductCosting(costing));
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

      const updated = await tx.productCosting.update({
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
      return serializeProductCosting(updated);
    });
  }

  const created = await prisma.productCosting.create({
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
  return serializeProductCosting(created);
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

  const created = await prisma.productCosting.create({
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
  return serializeProductCosting(created);
}

function serializeProductCosting(costing: {
  id: string;
  name: string;
  notes: string | null;
  yieldUnits: number | null;
  yieldUnitLabel: string | null;
  laborHours: { toNumber: () => number } | null;
  laborRateUGXPerHour: number | null;
  laborCostUGX: number | null;
  overheadMode: "FLAT_UGX" | "PERCENT_OF_SUBTOTAL";
  overheadValue: number;
  subtotalUGX: number;
  overheadUGX: number;
  totalCostUGX: number;
  costPerUnitUGX: number | null;
  markupBps: number | null;
  targetProfitUGX: number | null;
  targetMarginBps: number | null;
  pricingMode: "MARKUP" | "TARGET_PROFIT" | "TARGET_MARGIN" | "AUTO_RECOMMENDED";
  autoRecommendedPriceUGX: number | null;
  userSellingPriceUGX: number | null;
  updatedAt: Date;
  ingredientLines: Array<{
    id: string;
    name: string;
    qty: { toNumber: () => number };
    unit: "G" | "KG" | "ML" | "L" | "PCS";
    unitCostUGX: number;
  }>;
  packagingLines: Array<{
    id: string;
    name: string;
    costUGX: number;
  }>;
}) {
  return {
    id: costing.id,
    name: costing.name,
    notes: costing.notes,
    yieldUnits: costing.yieldUnits,
    yieldUnitLabel: costing.yieldUnitLabel,
    laborHours: costing.laborHours ? Number(costing.laborHours) : null,
    laborRateUGXPerHour: costing.laborRateUGXPerHour,
    laborCostUGX: costing.laborCostUGX,
    overheadMode: costing.overheadMode,
    overheadValue: costing.overheadValue,
    subtotalUGX: costing.subtotalUGX,
    overheadUGX: costing.overheadUGX,
    totalCostUGX: costing.totalCostUGX,
    costPerUnitUGX: costing.costPerUnitUGX,
    markupBps: costing.markupBps,
    targetProfitUGX: costing.targetProfitUGX,
    targetMarginBps: costing.targetMarginBps,
    pricingMode: costing.pricingMode,
    autoRecommendedPriceUGX: costing.autoRecommendedPriceUGX,
    userSellingPriceUGX: costing.userSellingPriceUGX,
    updatedAt: costing.updatedAt.toISOString(),
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
  };
}
