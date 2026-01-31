"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CostingRow = {
  id: string;
  name: string;
  totalCostUGX?: number | null;
  costPerUnitUGX?: number | null;
  updatedAt?: string;
};

export function CostingListPageClient({
  teamId,
  costings,
}: {
  teamId: string;
  costings: CostingRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return costings;
    }
    return costings.filter((item) =>
      item.name.toLowerCase().includes(normalized)
    );
  }, [costings, query]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Product Costings</h1>
        <p className="text-sm text-muted-foreground">
          View and open saved costings for this team.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <span className="text-muted-foreground">Search</span>
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search by product name"
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
          <div>Name</div>
          <div>Total cost (UGX)</div>
          <div>Cost per unit (UGX)</div>
          <div>Updated</div>
        </div>
        <div className="divide-y">
          {filtered.map((item) => (
            <div key={item.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
              <div className="font-medium">
                <Link
                  href={`/dashboard/${teamId}/costing?selected=${item.id}`}
                  className="hover:underline"
                >
                  {item.name}
                </Link>
              </div>
              <div>
                {typeof item.totalCostUGX === "number"
                  ? item.totalCostUGX.toLocaleString()
                  : "-"}
              </div>
              <div>
                {typeof item.costPerUnitUGX === "number"
                  ? item.costPerUnitUGX.toLocaleString()
                  : "-"}
              </div>
              <div>{formatDate(item.updatedAt)}</div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No costings match your search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}
