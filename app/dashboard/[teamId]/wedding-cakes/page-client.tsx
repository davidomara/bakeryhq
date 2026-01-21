"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeRecommendedPriceUGX } from "@/lib/costing/calculations";
import { weddingCostingInputSchema } from "@/lib/costing/schema";
import { upsertWeddingCosting } from "@/app/dashboard/[teamId]/wedding-cakes/actions";

const defaultTier = () => ({
  id: newRowId(),
  name: "",
  servings: null as number | null,
  flavor: "" as string | null,
  linkedProductCostingId: null as string | null,
  manualTierCostUGX: null as number | null,
});

const defaultExtra = () => ({
  id: newRowId(),
  name: "",
  costUGX: 0,
});

type TierRow = ReturnType<typeof defaultTier>;
type ExtraRow = ReturnType<typeof defaultExtra>;

type ProductOption = {
  id: string;
  name: string;
  totalCostUGX: number;
  costPerUnitUGX: number | null;
};

type WeddingCostingClient = {
  id?: string;
  clientName?: string | null;
  eventDate?: string | null;
  notes?: string | null;
  markupBps?: number | null;
  targetProfitUGX?: number | null;
  targetMarginBps?: number | null;
  userSellingPriceUGX?: number | null;
  tiers: TierRow[];
  extras: ExtraRow[];
};

const emptyCosting = (): WeddingCostingClient => ({
  clientName: "",
  eventDate: null,
  notes: "",
  markupBps: null,
  targetProfitUGX: null,
  targetMarginBps: null,
  userSellingPriceUGX: null,
  tiers: [defaultTier()],
  extras: [defaultExtra()],
});

export function WeddingCakesPageClient({
  teamId,
  initialCostings,
  productOptions,
}: {
  teamId: string;
  initialCostings: WeddingCostingClient[];
  productOptions: ProductOption[];
}) {
  const [costings, setCostings] = useState<WeddingCostingClient[]>(initialCostings);
  const [selectedId, setSelectedId] = useState<string | "new">(
    initialCostings[0]?.id ?? "new"
  );
  const [draft, setDraft] = useState<WeddingCostingClient>(
    initialCostings[0] ?? emptyCosting()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const tierCosts = useMemo(() => {
    return draft.tiers.map((tier) => {
      if (tier.linkedProductCostingId) {
        const product = productOptions.find((option) => option.id === tier.linkedProductCostingId);
        return product?.totalCostUGX ?? 0;
      }
      return tier.manualTierCostUGX ?? 0;
    });
  }, [draft.tiers, productOptions]);

  const totals = useMemo(() => {
    const tiersTotal = tierCosts.reduce((sum, cost) => sum + cost, 0);
    const extrasTotal = draft.extras.reduce((sum, extra) => sum + extra.costUGX, 0);
    const totalCostUGX = tiersTotal + extrasTotal;
    const totalServings = draft.tiers.reduce(
      (sum, tier) => sum + (tier.servings ?? 0),
      0
    );
    const costPerServingUGX = totalServings > 0 ? Math.round(totalCostUGX / totalServings) : null;

    return { tiersTotal, extrasTotal, totalCostUGX, totalServings, costPerServingUGX };
  }, [draft.extras, draft.tiers, tierCosts]);

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
        tiers: found.tiers.map((tier) => ({ ...tier })),
        extras: found.extras.map((extra) => ({ ...extra })),
      });
    }
  };

  const updateDraft = (patch: Partial<WeddingCostingClient>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    const filteredExtras = draft.extras.filter(
      (extra) => extra.name.trim() !== "" || extra.costUGX !== 0
    );
    const payload = {
      id: draft.id,
      clientName: draft.clientName,
      eventDate: draft.eventDate,
      notes: draft.notes,
      tiers: draft.tiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        servings: tier.servings,
        flavor: tier.flavor,
        linkedProductCostingId: tier.linkedProductCostingId,
        manualTierCostUGX: tier.manualTierCostUGX,
      })),
      extras: filteredExtras.map((extra) => ({
        id: extra.id,
        name: extra.name,
        costUGX: extra.costUGX,
      })),
      pricing: {
        markupBps: draft.markupBps,
        targetProfitUGX: draft.targetProfitUGX,
        targetMarginBps: draft.targetMarginBps,
        userSellingPriceUGX: draft.userSellingPriceUGX,
      },
    };

    const parsed = weddingCostingInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.errors.map((err) => err.message));
      return;
    }

    setErrors([]);
    startTransition(async () => {
      try {
        const saved = await upsertWeddingCosting(teamId, payload);
        const next = {
          id: saved.id,
          clientName: saved.clientName,
          eventDate: saved.eventDate ? saved.eventDate.toISOString().slice(0, 10) : null,
          notes: saved.notes,
          markupBps: saved.markupBps,
          targetProfitUGX: saved.targetProfitUGX,
          targetMarginBps: saved.targetMarginBps,
          userSellingPriceUGX: saved.userSellingPriceUGX,
          tiers: saved.tiers.map((tier) => ({
            id: tier.id,
            name: tier.name,
            servings: tier.servings,
            flavor: tier.flavor ?? "",
            linkedProductCostingId: tier.linkedProductCostingId,
            manualTierCostUGX: tier.manualTierCostUGX,
          })),
          extras: saved.extras.map((extra) => ({
            id: extra.id,
            name: extra.name,
            costUGX: extra.costUGX,
          })),
        };
        setCostings((prev) => {
          const filtered = prev.filter((item) => item.id !== saved.id);
          return [next, ...filtered];
        });
        setSelectedId(saved.id);
        setDraft(next);
      } catch (error) {
        console.error("Failed to save wedding costing", error);
        const message =
          error instanceof Error
            ? `Failed to save wedding costing. ${error.message}`
            : "Failed to save wedding costing. Please try again.";
        setErrors([message]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Wedding Cake Costing</h1>
          <p className="text-sm text-muted-foreground">
            Combine tiers, extras, and pricing for wedding quotes.
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
                {item.clientName || item.id}
              </option>
            ))}
          </select>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
          {draft.id ? (
            <Button asChild variant="outline">
              <a href={`/dashboard/${teamId}/wedding-cakes/export/${draft.id}`}>Download XLSX</a>
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
          <h2 className="text-lg font-semibold">Client Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Client name</label>
              <Input
                value={draft.clientName ?? ""}
                onChange={(event) => updateDraft({ clientName: event.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Event date</label>
              <Input
                type="date"
                value={draft.eventDate ?? ""}
                onChange={(event) => updateDraft({ eventDate: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={draft.notes ?? ""}
                onChange={(event) => updateDraft({ notes: event.target.value })}
                placeholder="Delivery, venue, theme"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <p className="text-xs text-muted-foreground">
            Choose markup, target profit, or target margin. Auto recommended shows the highest
            valid price for quick quotes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Markup (bps) <span className="text-xs text-muted-foreground">%</span>
              </label>
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
              <label className="text-sm font-medium">
                Target margin (bps) <span className="text-xs text-muted-foreground">%</span>
              </label>
              <Input
                type="number"
                value={draft.targetMarginBps ?? ""}
                onChange={(event) =>
                  updateDraft({ targetMarginBps: toNumber(event.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quoted price (UGX)</label>
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
              Auto recommended: UGX {formatNullable(pricing.autoRecommendedPriceUGX)}</div>
          </div>
          {underpriced ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
              Quoted price is below the recommended price.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tiers</h2>
          <Button
            variant="secondary"
            onClick={() => updateDraft({ tiers: [...draft.tiers, defaultTier()] })}
          >
            Add tier
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Tier</th>
                <th className="py-2">Servings</th>
                <th className="py-2">Flavor</th>
                <th className="py-2">Cost source</th>
                <th className="py-2">Tier cost (UGX)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draft.tiers.map((tier, index) => {
                const tierCost = tierCosts[index] ?? 0;
                return (
                  <tr key={tier.id} className="border-t">
                    <td className="py-2 pr-2">
                      <Input
                        value={tier.name}
                        onChange={(event) =>
                          updateTier(index, { name: event.target.value }, draft, setDraft)
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={tier.servings ?? ""}
                        onChange={(event) =>
                          updateTier(index, { servings: toNumber(event.target.value) }, draft, setDraft)
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        value={tier.flavor ?? ""}
                        onChange={(event) =>
                          updateTier(index, { flavor: event.target.value }, draft, setDraft)
                        }
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="border rounded-md px-2 py-2 text-sm"
                        value={tier.linkedProductCostingId ?? "manual"}
                        onChange={(event) => {
                          const value = event.target.value;
                          updateTier(
                            index,
                            {
                              linkedProductCostingId: value === "manual" ? null : value,
                            },
                            draft,
                            setDraft
                          );
                        }}
                      >
                        <option value="manual">Manual cost</option>
                        {productOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      {tier.linkedProductCostingId ? (
                        <div className="text-sm">{tierCost.toLocaleString()}</div>
                      ) : (
                        <Input
                          type="number"
                          value={tier.manualTierCostUGX ?? ""}
                          onChange={(event) =>
                            updateTier(
                              index,
                              { manualTierCostUGX: toNumber(event.target.value) },
                              draft,
                              setDraft
                            )
                          }
                        />
                      )}
                    </td>
                    <td className="py-2">
                      <Button variant="ghost" onClick={() => removeTier(index, draft, setDraft)}>
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
          <h2 className="text-lg font-semibold">Extras</h2>
          <Button
            variant="secondary"
            onClick={() => updateDraft({ extras: [...draft.extras, defaultExtra()] })}
          >
            Add extra
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Extra</th>
                <th className="py-2">Cost (UGX)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draft.extras.map((extra, index) => (
                <tr key={extra.id} className="border-t">
                  <td className="py-2 pr-2">
                    <Input
                      value={extra.name}
                      onChange={(event) =>
                        updateExtra(index, { name: event.target.value }, draft, setDraft)
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={extra.costUGX}
                      onChange={(event) =>
                        updateExtra(
                          index,
                          { costUGX: toNumber(event.target.value) ?? 0 },
                          draft,
                          setDraft
                        )
                      }
                    />
                  </td>
                  <td className="py-2">
                    <Button variant="ghost" onClick={() => removeExtra(index, draft, setDraft)}>
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
              <span>Tiers total</span>
              <span>UGX {totals.tiersTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Extras total</span>
              <span>UGX {totals.extrasTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total cost</span>
              <span>UGX {totals.totalCostUGX.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost per serving</span>
              <span>
                {totals.costPerServingUGX ? `UGX ${totals.costPerServingUGX.toLocaleString()}` : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quote view</h2>
            <Button variant="secondary" onClick={() => window.print()}>
              Print quote
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Client</span>
              <span>{draft.clientName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>Event date</span>
              <span>{draft.eventDate || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>Total servings</span>
              <span>{totals.totalServings || "-"}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Recommended price</span>
              <span>UGX {formatNullable(pricing.autoRecommendedPriceUGX)}</span>
            </div>
          </div>
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

function updateTier(
  index: number,
  patch: Partial<TierRow>,
  draft: WeddingCostingClient,
  setDraft: (value: WeddingCostingClient) => void
) {
  const next = [...draft.tiers];
  next[index] = { ...next[index], ...patch };
  setDraft({ ...draft, tiers: next });
}

function removeTier(
  index: number,
  draft: WeddingCostingClient,
  setDraft: (value: WeddingCostingClient) => void
) {
  const next = draft.tiers.filter((_, tierIndex) => tierIndex !== index);
  setDraft({
    ...draft,
    tiers: next.length ? next : [defaultTier()],
  });
}

function updateExtra(
  index: number,
  patch: Partial<ExtraRow>,
  draft: WeddingCostingClient,
  setDraft: (value: WeddingCostingClient) => void
) {
  const next = [...draft.extras];
  next[index] = { ...next[index], ...patch };
  setDraft({ ...draft, extras: next });
}

function removeExtra(
  index: number,
  draft: WeddingCostingClient,
  setDraft: (value: WeddingCostingClient) => void
) {
  const next = draft.extras.filter((_, extraIndex) => extraIndex !== index);
  setDraft({
    ...draft,
    extras: next.length ? next : [defaultExtra()],
  });
}
