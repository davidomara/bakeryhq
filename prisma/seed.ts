import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const teamId = "demo-team";

  await prisma.teamSettings.upsert({
    where: { teamId },
    update: {},
    create: {
      teamId,
      bakeryName: "BakeryHQ Demo",
      currency: "UGX",
      defaultMarkupBps: 3000,
      defaultOverheadMode: "PERCENT_OF_SUBTOTAL",
      defaultOverheadValue: 1000,
    },
  });

  const product = await prisma.productCosting.create({
    data: {
      teamId,
      name: "Vanilla Sponge Cake",
      yieldUnits: 12,
      yieldUnitLabel: "slices",
      notes: "Sample costing",
      laborHours: new Prisma.Decimal(2),
      laborRateUGXPerHour: 3000,
      laborCostUGX: 6000,
      overheadMode: "PERCENT_OF_SUBTOTAL",
      overheadValue: 1000,
      subtotalUGX: 20400,
      overheadUGX: 2040,
      totalCostUGX: 22440,
      costPerUnitUGX: 1870,
      markupBps: 3000,
      targetProfitUGX: 10000,
      targetMarginBps: 4000,
      pricingMode: "AUTO_RECOMMENDED",
      autoRecommendedPriceUGX: 37400,
      userSellingPriceUGX: 35000,
      ingredientLines: {
        create: [
          {
            name: "Flour",
            qty: new Prisma.Decimal(1000),
            unit: "G",
            unitCostUGX: 5000,
            lineCostUGX: 5000,
          },
          {
            name: "Sugar",
            qty: new Prisma.Decimal(500),
            unit: "G",
            unitCostUGX: 6000,
            lineCostUGX: 3000,
          },
          {
            name: "Butter",
            qty: new Prisma.Decimal(200),
            unit: "G",
            unitCostUGX: 12000,
            lineCostUGX: 2400,
          },
          {
            name: "Eggs",
            qty: new Prisma.Decimal(6),
            unit: "PCS",
            unitCostUGX: 500,
            lineCostUGX: 3000,
          },
        ],
      },
      packagingLines: {
        create: [{ name: "Cake box", costUGX: 1000 }],
      },
    },
  });

  const wedding = await prisma.weddingCosting.create({
    data: {
      teamId,
      clientName: "Amina & Joel",
      eventDate: new Date("2025-05-24"),
      notes: "Two-tier sample order",
      totalCostUGX: 120000,
      costPerServingUGX: 3000,
      markupBps: 2500,
      targetProfitUGX: 40000,
      targetMarginBps: 3500,
      autoRecommendedPriceUGX: 184615,
      userSellingPriceUGX: 180000,
      tiers: {
        create: [
          {
            name: "Bottom tier",
            servings: 30,
            flavor: "Vanilla",
            linkedProductCostingId: product.id,
            tierCostSnapshotUGX: 70000,
          },
          {
            name: "Top tier",
            servings: 10,
            flavor: "Chocolate",
            manualTierCostUGX: 30000,
          },
        ],
      },
      extras: {
        create: [
          { name: "Delivery", costUGX: 10000 },
          { name: "Flowers", costUGX: 10000 },
        ],
      },
    },
  });

  await prisma.salesEntry.createMany({
    data: [
      {
        teamId,
        date: new Date("2025-05-01"),
        productCostingId: product.id,
        productNameSnapshot: product.name,
        unitsSold: 5,
        sellingPricePerUnitUGX: 35000,
        costPerUnitSnapshotUGX: 1870,
        revenueUGX: 175000,
        cogsUGX: 9350,
        profitUGX: 165650,
        channel: "Instagram",
        notes: "May launch promo",
      },
      {
        teamId,
        date: new Date("2025-05-12"),
        productCostingId: product.id,
        productNameSnapshot: product.name,
        unitsSold: 3,
        sellingPricePerUnitUGX: 37000,
        costPerUnitSnapshotUGX: 1870,
        revenueUGX: 111000,
        cogsUGX: 5610,
        profitUGX: 105390,
        channel: "Walk-in",
        notes: "Repeat customers",
      },
      {
        teamId,
        date: new Date("2025-05-20"),
        productNameSnapshot: "Custom Wedding Cake",
        unitsSold: 1,
        sellingPricePerUnitUGX: 180000,
        costPerUnitSnapshotUGX: 120000,
        revenueUGX: 180000,
        cogsUGX: 120000,
        profitUGX: 60000,
        channel: "Referral",
        notes: "Linked to wedding sample",
      },
    ],
  });

  await prisma.weddingCosting.update({
    where: { id: wedding.id },
    data: { updatedAt: new Date() },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
