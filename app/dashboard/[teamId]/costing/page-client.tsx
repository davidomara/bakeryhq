"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  computeIngredientLineCostUGX,
  computeProductTotals,
  computeRecommendedPriceUGX,
} from "@/lib/costing/calculations";
import { productCostingInputSchema } from "@/lib/costing/schema";
import { duplicateProductCosting, upsertProductCosting } from "@/app/dashboard/[teamId]/costing/actions";

type IngredientUnit = "g" | "kg" | "ml" | "l" | "pcs";

const defaultIngredient = () => ({
  id: newRowId(),
  name: "",
  qty: 0,
  unit: "g" as IngredientUnit,
  unitCostUGX: 0,
});

const defaultPackaging = () => ({
  id: newRowId(),
  name: "",
  costUGX: 0,
});

type IngredientRow = {
  id: string;
  name: string;
  qty: number;
  unit: IngredientUnit;
  unitCostUGX: number;
};
type PackagingRow = ReturnType<typeof defaultPackaging>;

export type ProductCostingClient = {
  id?: string;
  name: string;
  notes?: string | null;
  yieldUnits?: number | null;
  yieldUnitLabel?: string | null;
  laborHours?: number | null;
  laborRateUGXPerHour?: number | null;
  overheadMode: "FLAT_UGX" | "PERCENT_OF_SUBTOTAL";
  overheadValue: number;
  markupBps?: number | null;
  targetProfitUGX?: number | null;
  targetMarginBps?: number | null;
  pricingMode?: "MARKUP" | "TARGET_PROFIT" | "TARGET_MARGIN" | "AUTO_RECOMMENDED";
  userSellingPriceUGX?: number | null;
  ingredientLines: IngredientRow[];
  packagingLines: PackagingRow[];
};

const emptyCosting = (): ProductCostingClient => ({
  name: "",
  notes: "",
  yieldUnits: null,
  yieldUnitLabel: "",
  laborHours: null,
  laborRateUGXPerHour: null,
  overheadMode: "FLAT_UGX",
  overheadValue: 0,
  markupBps: null,
  targetProfitUGX: null,
  targetMarginBps: null,
  pricingMode: "AUTO_RECOMMENDED",
  userSellingPriceUGX: null,
  ingredientLines: [defaultIngredient()],
  packagingLines: [defaultPackaging()],
});

export function CostingPageClient({
  teamId,
  initialCostings,
}: {
  teamId: string;
  initialCostings: ProductCostingClient[];
}) {
  const [costings, setCostings] = useState<ProductCostingClient[]>(initialCostings);
  const [selectedId, setSelectedId] = useState<string | "new">(
    initialCostings[0]?.id ?? "new"
  );
  const [draft, setDraft] = useState<ProductCostingClient>(
    initialCostings[0] ?? emptyCosting()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    return computeProductTotals({
      ingredients: draft.ingredientLines.map((line) => ({
        qty: line.qty,
        unit: line.unit,
        unitCostUGX: line.unitCostUGX,
      })),
      packaging: draft.packagingLines.map((line) => ({ costUGX: line.costUGX })),
      labor: {
        hours: draft.laborHours ?? 0,
        rateUGXPerHour: draft.laborRateUGXPerHour ?? 0,
      },
      overhead: {
        mode: draft.overheadMode === "FLAT_UGX" ? "flatUGX" : "percentOfSubtotal",
        value: draft.overheadValue,
      },
      yieldUnits: draft.yieldUnits ?? null,
    });
  }, [draft]);

  const pricing = useMemo(() => {
    return computeRecommendedPriceUGX(
      totals.totalCostUGX,
      draft.markupBps ?? null,
      draft.targetProfitUGX ?? null,
      draft.targetMarginBps ?? null
    );
  }, [draft, totals.totalCostUGX]);

  const underpriced =
    typeof draft.userSellingPriceUGX === "number" &&
    typeof pricing.autoRecommendedPriceUGX === "number" &&
    draft.userSellingPriceUGX < pricing.autoRecommendedPriceUGX;

  const selectCosting = (id: string | "new") => {
    setSelectedId(id);
    if (id === "new") {
      setDraft(emptyCosting());
      return;
    }
    const found = costings.find((item) => item.id === id);
    if (found) {
      setDraft({
        ...found,
        pricingMode: found.pricingMode ?? "AUTO_RECOMMENDED",
        ingredientLines: found.ingredientLines.map((line) => ({ ...line })),
        packagingLines: found.packagingLines.map((line) => ({ ...line })),
      });
    }
  };

  const updateDraft = (patch: Partial<ProductCostingClient>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    const payload = {
      id: draft.id,
      name: draft.name,
      notes: draft.notes,
      ingredients: draft.ingredientLines.map((line) => ({
        id: line.id,
        name: line.name,
        qty: line.qty,
        unit: line.unit,
        unitCostUGX: line.unitCostUGX,
      })),
      packaging: draft.packagingLines.map((line) => ({
        id: line.id,
        name: line.name,
        costUGX: line.costUGX,
      })),
      laborHours: draft.laborHours,
      laborRateUGXPerHour: draft.laborRateUGXPerHour,
      overhead: {
        mode: draft.overheadMode === "FLAT_UGX" ? "flatUGX" : "percentOfSubtotal",
        value: draft.overheadValue,
      },
      yieldUnits: draft.yieldUnits,
      yieldUnitLabel: draft.yieldUnitLabel,
      pricing: {
        markupBps: draft.markupBps,
        targetProfitUGX: draft.targetProfitUGX,
        targetMarginBps: draft.targetMarginBps,
        userSellingPriceUGX: draft.userSellingPriceUGX,
      },
      pricingMode: draft.pricingMode,
    };

    const parsed = productCostingInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.errors.map((err) => err.message));
      return;
    }

    setErrors([]);
    startTransition(async () => {
      const saved = await upsertProductCosting(teamId, payload);
      setCostings((prev) => {
        const next = prev.filter((item) => item.id !== saved.id);
        return [
          {
            id: saved.id,
            name: saved.name,
            notes: saved.notes,
            yieldUnits: saved.yieldUnits,
            yieldUnitLabel: saved.yieldUnitLabel,
            laborHours: saved.laborHours ? Number(saved.laborHours) : null,
            laborRateUGXPerHour: saved.laborRateUGXPerHour,
            overheadMode: saved.overheadMode,
            overheadValue: saved.overheadValue,
            markupBps: saved.markupBps,
            targetProfitUGX: saved.targetProfitUGX,
            targetMarginBps: saved.targetMarginBps,
            pricingMode: saved.pricingMode,
            userSellingPriceUGX: saved.userSellingPriceUGX,
            ingredientLines: saved.ingredientLines.map((line) => ({
              id: line.id,
              name: line.name,
              qty: Number(line.qty),
              unit: line.unit === "G" ? "g" : line.unit === "KG" ? "kg" : line.unit === "ML" ? "ml" : line.unit === "L" ? "l" : "pcs",
              unitCostUGX: line.unitCostUGX,
            })),
            packagingLines: saved.packagingLines.map((line) => ({
              id: line.id,
              name: line.name,
              costUGX: line.costUGX,
            })),
          },
          ...next,
        ];
      });
      setSelectedId(saved.id);
      setDraft((prev) => ({ ...prev, id: saved.id }));
    });
  };

  const handleDuplicate = () => {
    if (!draft.id) {
      return;
    }

    startTransition(async () => {
      const duplicated = await duplicateProductCosting(teamId, draft.id!);
      const next = {
        id: duplicated.id,
        name: duplicated.name,
        notes: duplicated.notes,
        yieldUnits: duplicated.yieldUnits,
        yieldUnitLabel: duplicated.yieldUnitLabel,
        laborHours: duplicated.laborHours ? Number(duplicated.laborHours) : null,
        laborRateUGXPerHour: duplicated.laborRateUGXPerHour,
        overheadMode: duplicated.overheadMode,
        overheadValue: duplicated.overheadValue,
        markupBps: duplicated.markupBps,
        targetProfitUGX: duplicated.targetProfitUGX,
        targetMarginBps: duplicated.targetMarginBps,
        pricingMode: duplicated.pricingMode,
        userSellingPriceUGX: duplicated.userSellingPriceUGX,
        ingredientLines: duplicated.ingredientLines.map((line) => ({
          id: line.id,
          name: line.name,
          qty: Number(line.qty),
          unit: line.unit === "G" ? "g" : line.unit === "KG" ? "kg" : line.unit === "ML" ? "ml" : line.unit === "L" ? "l" : "pcs",
          unitCostUGX: line.unitCostUGX,
        })),
        packagingLines: duplicated.packagingLines.map((line) => ({
          id: line.id,
          name: line.name,
          costUGX: line.costUGX,
        })),
      };
      setCostings((prev) => [next, ...prev]);
      setSelectedId(next.id!);
      setDraft(next);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Product Costing</h1>
          <p className="text-sm text-muted-foreground">
            Build a costing template and get pricing recommendations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={selectedId}
            onChange={(event) => selectCosting(event.target.value)}
          >
            <option value="new">New costing</option>
            {costings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={handleDuplicate} disabled={!draft.id || isPending}>
            Duplicate
          </Button>
          {draft.id ? (
            <Button asChild variant="outline">
              <a href={`/dashboard/${teamId}/costing/export/${draft.id}`}>Download XLSX</a>
            </Button>
          ) : null}
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Basics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Product name</label>
              <Input
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                placeholder="Chocolate sponge"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Yield units</label>
              <Input
                type="number"
                value={draft.yieldUnits ?? ""}
                onChange={(event) => updateDraft({ yieldUnits: toNumber(event.target.value) })}
                placeholder="12"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Yield unit label</label>
              <Input
                value={draft.yieldUnitLabel ?? ""}
                onChange={(event) => updateDraft({ yieldUnitLabel: event.target.value })}
                placeholder="slices"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={draft.notes ?? ""}
                onChange={(event) => updateDraft({ notes: event.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Labor & Overhead</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Labor hours</label>
              <Input
                type="number"
                value={draft.laborHours ?? ""}
                onChange={(event) => updateDraft({ laborHours: toNumber(event.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rate UGX/hr</label>
              <Input
                type="number"
                value={draft.laborRateUGXPerHour ?? ""}
                onChange={(event) =>
                  updateDraft({ laborRateUGXPerHour: toNumber(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Overhead</label>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-2 py-2 text-sm"
                  value={draft.overheadMode}
                  onChange={(event) =>
                    updateDraft({
                      overheadMode: event.target.value as "FLAT_UGX" | "PERCENT_OF_SUBTOTAL",
                    })
                  }
                >
                  <option value="FLAT_UGX">Flat UGX</option>
                  <option value="PERCENT_OF_SUBTOTAL">% of subtotal</option>
                </select>
                <Input
                  type="number"
                  value={draft.overheadValue}
                  onChange={(event) =>
                    updateDraft({ overheadValue: toNumber(event.target.value) ?? 0 })
                  }
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Labor cost: UGX {totals.laborCostUGX.toLocaleString()}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <Button
            variant="secondary"
            onClick={() =>
              updateDraft({
                ingredientLines: [...draft.ingredientLines, defaultIngredient()],
              })
            }
          >
            Add ingredient
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Ingredient</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Unit</th>
                <th className="py-2">Unit cost (UGX)</th>
                <th className="py-2">Line cost (UGX)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draft.ingredientLines.map((line, index) => {
                const lineCost = computeIngredientLineCostUGX({
                  qty: line.qty,
                  unit: line.unit,
                  unitCostUGX: line.unitCostUGX,
                });

                return (
                  <tr key={line.id} className="border-t">
                    <td className="py-2 pr-2">
                      <Input
                        value={line.name}
                        onChange={(event) =>
                          updateIngredient(index, { name: event.target.value }, draft, setDraft)
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={line.qty}
                        onChange={(event) =>
                          updateIngredient(index, { qty: toNumber(event.target.value) ?? 0 }, draft, setDraft)
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="border rounded-md px-2 py-2 text-sm"
                        value={line.unit}
                        onChange={(event) =>
                          updateIngredient(index, { unit: event.target.value as IngredientRow["unit"] }, draft, setDraft)
                        }
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={line.unitCostUGX}
                        onChange={(event) =>
                          updateIngredient(
                            index,
                            { unitCostUGX: toNumber(event.target.value) ?? 0 },
                            draft,
                            setDraft
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-2 text-sm">
                      {lineCost.toLocaleString()}
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        onClick={() => removeIngredient(index, draft, setDraft)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Packaging</h2>
          <Button
            variant="secondary"
            onClick={() =>
              updateDraft({ packagingLines: [...draft.packagingLines, defaultPackaging()] })
            }
          >
            Add packaging
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Packaging</th>
                <th className="py-2">Cost (UGX)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draft.packagingLines.map((line, index) => (
                <tr key={line.id} className="border-t">
                  <td className="py-2 pr-2">
                    <Input
                      value={line.name}
                      onChange={(event) =>
                        updatePackaging(index, { name: event.target.value }, draft, setDraft)
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={line.costUGX}
                      onChange={(event) =>
                        updatePackaging(
                          index,
                          { costUGX: toNumber(event.target.value) ?? 0 },
                          draft,
                          setDraft
                        )
                      }
                    />
                  </td>
                  <td className="py-2">
                    <Button
                      variant="ghost"
                      onClick={() => removePackaging(index, draft, setDraft)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Totals</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>UGX {totals.subtotalUGX.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Overhead</span>
              <span>UGX {totals.overheadUGX.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total cost</span>
              <span>UGX {totals.totalCostUGX.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost per unit</span>
              <span>
                {totals.costPerUnitUGX ? `UGX ${totals.costPerUnitUGX.toLocaleString()}` : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Markup (bps)</label>
              <Input
                type="number"
                value={draft.markupBps ?? ""}
                onChange={(event) => updateDraft({ markupBps: toNumber(event.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target profit (UGX)</label>
              <Input
                type="number"
                value={draft.targetProfitUGX ?? ""}
                onChange={(event) =>
                  updateDraft({ targetProfitUGX: toNumber(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target margin (bps)</label>
              <Input
                type="number"
                value={draft.targetMarginBps ?? ""}
                onChange={(event) =>
                  updateDraft({ targetMarginBps: toNumber(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pricing mode</label>
              <select
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={draft.pricingMode}
                onChange={(event) =>
                  updateDraft({
                    pricingMode: event.target.value as ProductCostingClient["pricingMode"],
                  })
                }
              >
                <option value="MARKUP">Markup</option>
                <option value="TARGET_PROFIT">Target profit</option>
                <option value="TARGET_MARGIN">Target margin</option>
                <option value="AUTO_RECOMMENDED">Auto recommended</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Selling price (UGX)</label>
              <Input
                type="number"
                value={draft.userSellingPriceUGX ?? ""}
                onChange={(event) =>
                  updateDraft({ userSellingPriceUGX: toNumber(event.target.value) })
                }
              />
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Markup price: UGX {formatNullable(pricing.markupPriceUGX)}</div>
            <div>Target profit price: UGX {formatNullable(pricing.targetProfitPriceUGX)}</div>
            <div>Target margin price: UGX {formatNullable(pricing.targetMarginPriceUGX)}</div>
            <div className="font-medium text-foreground">
              Auto recommended: UGX {formatNullable(pricing.autoRecommendedPriceUGX)}
            </div>
          </div>
          {underpriced ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
              Selling price is below the recommended price.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function newRowId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toNumber(value: string) {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNullable(value: number | null) {
  return typeof value === "number" ? value.toLocaleString() : "-";
}

function updateIngredient(
  index: number,
  patch: Partial<IngredientRow>,
  draft: ProductCostingClient,
  setDraft: (value: ProductCostingClient) => void
) {
  const next = [...draft.ingredientLines];
  next[index] = { ...next[index], ...patch };
  setDraft({ ...draft, ingredientLines: next });
}

function removeIngredient(
  index: number,
  draft: ProductCostingClient,
  setDraft: (value: ProductCostingClient) => void
) {
  const next = draft.ingredientLines.filter((_, lineIndex) => lineIndex !== index);
  setDraft({
    ...draft,
    ingredientLines: next.length ? next : [defaultIngredient()],
  });
}

function updatePackaging(
  index: number,
  patch: Partial<PackagingRow>,
  draft: ProductCostingClient,
  setDraft: (value: ProductCostingClient) => void
) {
  const next = [...draft.packagingLines];
  next[index] = { ...next[index], ...patch };
  setDraft({ ...draft, packagingLines: next });
}

function removePackaging(
  index: number,
  draft: ProductCostingClient,
  setDraft: (value: ProductCostingClient) => void
) {
  const next = draft.packagingLines.filter((_, lineIndex) => lineIndex !== index);
  setDraft({
    ...draft,
    packagingLines: next.length ? next : [defaultPackaging()],
  });
}
