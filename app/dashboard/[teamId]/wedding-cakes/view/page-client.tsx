"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type WeddingCostingRow = {
  id: string;
  clientName?: string | null;
  eventDate?: string | null;
  totalCostUGX?: number | null;
  costPerServingUGX?: number | null;
  updatedAt?: string;
};

export function WeddingCostingListPageClient({
  teamId,
  costings,
}: {
  teamId: string;
  costings: WeddingCostingRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return costings;
    }
    return costings.filter((item) =>
      (item.clientName ?? "").toLowerCase().includes(normalized)
    );
  }, [costings, query]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Wedding Cake Costings</h1>
        <p className="text-sm text-muted-foreground">
          View and open saved wedding cake costings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <span className="text-muted-foreground">Search</span>
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search by client name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} of {costings.length} shown
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-4 gap-4 border-b px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
          <div>Client</div>
          <div>Total cost (UGX)</div>
          <div>Cost per serving (UGX)</div>
          <div>Event date</div>
        </div>
        <div className="divide-y">
          {filtered.map((item) => (
            <div key={item.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
              <div className="font-medium">
                <Link
                  href={`/dashboard/${teamId}/wedding-cakes?selected=${item.id}`}
                  className="hover:underline"
                >
                  {item.clientName || "Untitled"}
                </Link>
              </div>
              <div>
                {typeof item.totalCostUGX === "number"
                  ? item.totalCostUGX.toLocaleString()
                  : "-"}
              </div>
              <div>
                {typeof item.costPerServingUGX === "number"
                  ? item.costPerServingUGX.toLocaleString()
                  : "-"}
              </div>
              <div>{formatDate(item.eventDate)}</div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No wedding costings match your search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}
