export type IngredientUnit = "g" | "kg" | "ml" | "l" | "pcs";

export type IngredientLineInput = {
  qty: number;
  unit: IngredientUnit;
  unitCostUGX: number;
};

export type PackagingLineInput = {
  costUGX: number;
};

export type LaborInput = {
  hours?: number | null;
  rateUGXPerHour?: number | null;
};

export type OverheadInput = {
  mode: "flatUGX" | "percentOfSubtotal";
  value: number;
};

export function normalizeQuantity(qty: number, unit: IngredientUnit) {
  switch (unit) {
    case "g":
      return qty / 1000;
    case "kg":
      return qty;
    case "ml":
      return qty / 1000;
    case "l":
      return qty;
    case "pcs":
      return qty;
    default:
      return qty;
  }
}

export function computeIngredientLineCostUGX(input: IngredientLineInput) {
  const { qty, unit, unitCostUGX } = input;
  if (unit === "g" || unit === "ml") {
    return Math.round((qty * unitCostUGX) / 1000);
  }

  return Math.round(qty * unitCostUGX);
}

export function computeLaborCostUGX(input: LaborInput) {
  const hours = input.hours ?? 0;
  const rate = input.rateUGXPerHour ?? 0;
  return Math.round(hours * rate);
}

export function computeProductTotals(input: {
  ingredients: IngredientLineInput[];
  packaging: PackagingLineInput[];
  labor: LaborInput;
  overhead: OverheadInput;
  yieldUnits?: number | null;
}) {
  const ingredientSubtotalUGX = input.ingredients.reduce(
    (sum, line) => sum + computeIngredientLineCostUGX(line),
    0
  );
  const packagingSubtotalUGX = input.packaging.reduce(
    (sum, line) => sum + line.costUGX,
    0
  );
  const laborCostUGX = computeLaborCostUGX(input.labor);
  const subtotalUGX = ingredientSubtotalUGX + packagingSubtotalUGX + laborCostUGX;

  const overheadUGX =
    input.overhead.mode === "percentOfSubtotal"
      ? Math.round((subtotalUGX * input.overhead.value) / 10000)
      : Math.round(input.overhead.value);

  const totalCostUGX = subtotalUGX + overheadUGX;
  const yieldUnits = input.yieldUnits ?? 0;
  const costPerUnitUGX = yieldUnits > 0 ? Math.round(totalCostUGX / yieldUnits) : null;

  return {
    ingredientSubtotalUGX,
    packagingSubtotalUGX,
    laborCostUGX,
    subtotalUGX,
    overheadUGX,
    totalCostUGX,
    costPerUnitUGX,
  };
}

export function computeRecommendedPriceUGX(
  totalCostUGX: number,
  markupBps?: number | null,
  targetProfitUGX?: number | null,
  targetMarginBps?: number | null
) {
  const markupPriceUGX =
    typeof markupBps === "number"
      ? totalCostUGX + Math.round((totalCostUGX * markupBps) / 10000)
      : null;
  const targetProfitPriceUGX =
    typeof targetProfitUGX === "number" ? totalCostUGX + targetProfitUGX : null;
  const targetMarginPriceUGX =
    typeof targetMarginBps === "number" && targetMarginBps < 10000
      ? Math.round((totalCostUGX * 10000) / (10000 - targetMarginBps))
      : null;

  const candidates = [markupPriceUGX, targetProfitPriceUGX, targetMarginPriceUGX].filter(
    (value): value is number => typeof value === "number"
  );
  const autoRecommendedPriceUGX = candidates.length ? Math.max(...candidates) : null;

  return {
    markupPriceUGX,
    targetProfitPriceUGX,
    targetMarginPriceUGX,
    autoRecommendedPriceUGX,
  };
}

export function computeMarginBps(revenueUGX: number, profitUGX: number) {
  if (revenueUGX <= 0) {
    return 0;
  }

  return Math.round((profitUGX * 10000) / revenueUGX);
}
