"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertSalesEntry } from "@/app/dashboard/[teamId]/sales/actions";
import { salesEntryInputSchema } from "@/lib/costing/schema";

type ProductOption = {
  id: string;
  name: string;
  costPerUnitUGX: number | null;
};

type SalesEntry = {
  id?: string;
  date: string;
  productCostingId: string | null;
  productNameSnapshot: string;
  unitsSold: number;
  sellingPricePerUnitUGX: number;
  costPerUnitSnapshotUGX: number;
  channel?: string | null;
  notes?: string | null;
};

const emptyEntry = (): SalesEntry => ({
  date: getLocalDateString(),
  productCostingId: null,
  productNameSnapshot: "",
  unitsSold: 1,
  sellingPricePerUnitUGX: 0,
  costPerUnitSnapshotUGX: 0,
  channel: "",
  notes: "",
});

export function SalesNewPageClient({
  teamId,
  products,
}: {
  teamId: string;
  products: ProductOption[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<SalesEntry>(emptyEntry());
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  const revenuePreview = useMemo(() => {
    return draft.unitsSold * draft.sellingPricePerUnitUGX;
  }, [draft]);

  const cogsPreview = useMemo(() => {
    return draft.unitsSold * draft.costPerUnitSnapshotUGX;
  }, [draft]);

  const handleSave = () => {
    const payload = {
      id: draft.id,
      date: draft.date,
      productCostingId: draft.productCostingId,
      productNameSnapshot: draft.productNameSnapshot,
      unitsSold: draft.unitsSold,
      sellingPricePerUnitUGX: draft.sellingPricePerUnitUGX,
      costPerUnitSnapshotUGX: draft.costPerUnitSnapshotUGX,
      channel: draft.channel,
      notes: draft.notes,
    };

    const parsed = salesEntryInputSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.errors.map((err) => err.message));
      setStatus("");
      return;
    }

    setErrors([]);
    setStatus("");
    startTransition(async () => {
      try {
        await upsertSalesEntry(teamId, payload);
        setDraft(emptyEntry());
        setStatus("Sale saved.");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setErrors([`Failed to save sale.${message ? ` ${message}` : ""}`]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Add Sale</h1>
          <p className="text-sm text-muted-foreground">
            Capture a single sale for your monthly profit summary.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/${teamId}/sales`)}>
          Back to Sales Summary
        </Button>
      </div>

      <section className="rounded-lg border p-4 space-y-3">
        {errors.length > 0 ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.map((error, index) => (
              <div key={`error-${index}`}>{error}</div>
            ))}
          </div>
        ) : null}
        {status ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {status}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Product</label>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={draft.productCostingId ?? ""}
              onChange={(event) => {
                const value = event.target.value || null;
                const product = products.find((item) => item.id === value);
                setDraft({
                  ...draft,
                  productCostingId: value,
                  productNameSnapshot: product?.name ?? "",
                  costPerUnitSnapshotUGX: product?.costPerUnitUGX ?? draft.costPerUnitSnapshotUGX,
                });
              }}
            >
              <option value="">Manual</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Product name</label>
            <Input
              value={draft.productNameSnapshot}
              onChange={(event) => setDraft({ ...draft, productNameSnapshot: event.target.value })}
              disabled={Boolean(draft.productCostingId)}
              className={draft.productCostingId ? "bg-muted" : undefined}
              placeholder="Custom cake"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Units sold</label>
            <Input
              type="number"
              value={draft.unitsSold}
              onChange={(event) =>
                setDraft({ ...draft, unitsSold: toNumber(event.target.value) ?? 0 })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Selling price / unit</label>
            <Input
              type="number"
              value={draft.sellingPricePerUnitUGX}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  sellingPricePerUnitUGX: toNumber(event.target.value) ?? 0,
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cost / unit</label>
            <Input
              type="number"
              value={draft.costPerUnitSnapshotUGX}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  costPerUnitSnapshotUGX: toNumber(event.target.value) ?? 0,
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Channel</label>
            <Input
              value={draft.channel ?? ""}
              onChange={(event) => setDraft({ ...draft, channel: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={draft.notes ?? ""}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Revenue preview: UGX {revenuePreview.toLocaleString()} | COGS preview: UGX{" "}
          {cogsPreview.toLocaleString()}
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save sale"}
        </Button>
      </section>
    </div>
  );
}

function toNumber(value: string) {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
