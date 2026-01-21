import { describe, expect, it } from "vitest";
import {
  computeIngredientLineCostUGX,
  computeMarginBps,
  computeProductTotals,
  computeRecommendedPriceUGX,
  normalizeQuantity,
} from "@/lib/costing/calculations";

describe("normalizeQuantity", () => {
  it("normalizes grams to kilograms", () => {
    expect(normalizeQuantity(500, "g")).toBeCloseTo(0.5);
  });

  it("normalizes milliliters to liters", () => {
    expect(normalizeQuantity(250, "ml")).toBeCloseTo(0.25);
  });

  it("keeps pcs as-is", () => {
    expect(normalizeQuantity(6, "pcs")).toBe(6);
  });
});

describe("computeIngredientLineCostUGX", () => {
  it("computes cost for gram-based inputs", () => {
    expect(
      computeIngredientLineCostUGX({ qty: 200, unit: "g", unitCostUGX: 12000 })
    ).toBe(2400);
  });

  it("computes cost for pcs inputs", () => {
    expect(
      computeIngredientLineCostUGX({ qty: 4, unit: "pcs", unitCostUGX: 500 })
    ).toBe(2000);
  });
});

describe("computeProductTotals", () => {
  it("computes totals with overhead", () => {
    const totals = computeProductTotals({
      ingredients: [
        { qty: 1000, unit: "g", unitCostUGX: 5000 },
        { qty: 6, unit: "pcs", unitCostUGX: 500 },
      ],
      packaging: [{ costUGX: 1000 }],
      labor: { hours: 2, rateUGXPerHour: 3000 },
      overhead: { mode: "percentOfSubtotal", value: 1000 },
      yieldUnits: 10,
    });

    expect(totals.subtotalUGX).toBe(5000 + 3000 + 1000 + 6000);
    expect(totals.overheadUGX).toBe(Math.round(totals.subtotalUGX * 0.1));
    expect(totals.totalCostUGX).toBe(totals.subtotalUGX + totals.overheadUGX);
    expect(totals.costPerUnitUGX).toBe(Math.round(totals.totalCostUGX / 10));
  });
});

describe("computeRecommendedPriceUGX", () => {
  it("selects max valid recommended price", () => {
    const result = computeRecommendedPriceUGX(20000, 2500, 5000, 3000);
    expect(result.markupPriceUGX).toBe(25000);
    expect(result.targetProfitPriceUGX).toBe(25000);
    expect(result.targetMarginPriceUGX).toBe(Math.round((20000 * 10000) / 7000));
    expect(result.autoRecommendedPriceUGX).toBe(result.targetMarginPriceUGX);
  });
});

describe("computeMarginBps", () => {
  it("computes margin basis points", () => {
    expect(computeMarginBps(10000, 2500)).toBe(2500);
  });

  it("returns 0 when revenue is zero", () => {
    expect(computeMarginBps(0, 1000)).toBe(0);
  });
});
