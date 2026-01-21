"use server";

import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";
import { computeMarginBps } from "@/lib/costing/calculations";
import { salesEntryInputSchema } from "@/lib/costing/schema";

export async function listSalesData(
  teamId: string,
  rawFilters: {
    startDate?: string | null;
    endDate?: string | null;
    productCostingId?: string | null;
    channel?: string | null;
  }
) {
  await requireTeamContext(teamId);

  const filters = rawFilters || {};
  const where: Record<string, unknown> = { teamId };

  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
      ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
    };
  }

  if (filters.productCostingId) {
    where.productCostingId = filters.productCostingId;
  }

  if (filters.channel) {
    where.channel = filters.channel;
  }

  const entries = await prisma.salesEntry.findMany({
    where,
    orderBy: { date: "desc" },
    include: { productCosting: true },
  });

  const monthlyMap = new Map<string, {
    revenueUGX: number;
    cogsUGX: number;
    profitUGX: number;
  }>();

  entries.forEach((entry) => {
    const key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyMap.get(key) ?? { revenueUGX: 0, cogsUGX: 0, profitUGX: 0 };
    monthlyMap.set(key, {
      revenueUGX: existing.revenueUGX + entry.revenueUGX,
      cogsUGX: existing.cogsUGX + entry.cogsUGX,
      profitUGX: existing.profitUGX + entry.profitUGX,
    });
  });

  const monthlyRollups = Array.from(monthlyMap.entries())
    .map(([month, totals]) => ({
      month,
      totalRevenueUGX: totals.revenueUGX,
      totalCogsUGX: totals.cogsUGX,
      totalProfitUGX: totals.profitUGX,
      avgMarginBps: computeMarginBps(totals.revenueUGX, totals.profitUGX),
    }))
    .sort((a, b) => (a.month > b.month ? -1 : 1));

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      productCostingId: entry.productCostingId,
      productNameSnapshot: entry.productNameSnapshot,
      unitsSold: entry.unitsSold,
      sellingPricePerUnitUGX: entry.sellingPricePerUnitUGX,
      costPerUnitSnapshotUGX: entry.costPerUnitSnapshotUGX,
      revenueUGX: entry.revenueUGX,
      cogsUGX: entry.cogsUGX,
      profitUGX: entry.profitUGX,
      marginBps: computeMarginBps(entry.revenueUGX, entry.profitUGX),
      channel: entry.channel,
      notes: entry.notes,
    })),
    monthlyRollups,
  };
}

export async function listProductCostingOptions(teamId: string) {
  await requireTeamContext(teamId);
  return prisma.productCosting.findMany({
    where: { teamId },
    select: { id: true, name: true, costPerUnitUGX: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertSalesEntry(teamId: string, rawInput: unknown) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);
  const input = salesEntryInputSchema.parse(rawInput);

  let costPerUnitSnapshotUGX = input.costPerUnitSnapshotUGX;
  if (input.productCostingId) {
    const product = await prisma.productCosting.findFirst({
      where: { id: input.productCostingId, teamId: resolvedTeamId },
      select: { costPerUnitUGX: true, name: true },
    });
    if (product?.costPerUnitUGX != null) {
      costPerUnitSnapshotUGX = product.costPerUnitUGX;
    }
  }

  const revenueUGX = input.unitsSold * input.sellingPricePerUnitUGX;
  const cogsUGX = input.unitsSold * costPerUnitSnapshotUGX;
  const profitUGX = revenueUGX - cogsUGX;

  const data = {
    teamId: resolvedTeamId,
    date: new Date(input.date),
    productCostingId: input.productCostingId ?? null,
    productNameSnapshot: input.productNameSnapshot,
    unitsSold: input.unitsSold,
    sellingPricePerUnitUGX: input.sellingPricePerUnitUGX,
    costPerUnitSnapshotUGX,
    revenueUGX,
    cogsUGX,
    profitUGX,
    channel: input.channel ?? null,
    notes: input.notes ?? null,
  } as const;

  if (input.id) {
    const existing = await prisma.salesEntry.findFirst({
      where: { id: input.id, teamId: resolvedTeamId },
    });
    if (!existing) {
      throw new Error("Sales entry not found.");
    }

    return prisma.salesEntry.update({
      where: { id: input.id },
      data,
    });
  }

  return prisma.salesEntry.create({ data });
}
