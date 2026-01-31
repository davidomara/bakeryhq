"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listSalesData } from "@/app/dashboard/[teamId]/sales/actions";

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
  revenueUGX?: number;
  cogsUGX?: number;
  profitUGX?: number;
  marginBps?: number;
};

type SalesData = {
  entries: SalesEntry[];
  monthlyRollups: {
    month: string;
    totalRevenueUGX: number;
    totalCogsUGX: number;
    totalProfitUGX: number;
    avgMarginBps: number;
  }[];
};

export function SalesPageClient({
  teamId,
  products,
  initialData,
}: {
  teamId: string;
  products: ProductOption[];
  initialData: SalesData;
}) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    productCostingId: "",
    channel: "",
  });
  const [data, setData] = useState<SalesData>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const filtered = await listSalesData(teamId, {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        productCostingId: filters.productCostingId || null,
        channel: filters.channel || null,
      });
      setData(filtered);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Monthly Profit Summary</h1>
        <p className="text-sm text-muted-foreground">
          Log sales and review monthly profitability.
        </p>
      </div>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium">Start date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">End date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Product</label>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filters.productCostingId}
              onChange={(event) =>
                setFilters({ ...filters, productCostingId: event.target.value })
              }
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Channel</label>
            <Input
              value={filters.channel}
              onChange={(event) => setFilters({ ...filters, channel: event.target.value })}
              placeholder="Instagram"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleFilter} disabled={isPending}>
            Apply filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams({
                ...(filters.startDate ? { startDate: filters.startDate } : {}),
                ...(filters.endDate ? { endDate: filters.endDate } : {}),
                ...(filters.productCostingId
                  ? { productCostingId: filters.productCostingId }
                  : {}),
                ...(filters.channel ? { channel: filters.channel } : {}),
              });
              window.open(`/dashboard/${teamId}/sales/export?${params.toString()}`, "_blank");
            }}
          >
            Download XLSX
          </Button>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Monthly rollups</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Month</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">COGS</th>
                <th className="py-2">Profit</th>
                <th className="py-2">Avg margin (bps)</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyRollups.map((row) => (
                <tr key={row.month} className="border-t">
                  <td className="py-2 pr-2">{row.month}</td>
                  <td className="py-2 pr-2">{row.totalRevenueUGX.toLocaleString()}</td>
                  <td className="py-2 pr-2">{row.totalCogsUGX.toLocaleString()}</td>
                  <td className="py-2 pr-2">{row.totalProfitUGX.toLocaleString()}</td>
                  <td className="py-2 pr-2">{row.avgMarginBps}</td>
                </tr>
              ))}
              {data.monthlyRollups.length === 0 ? (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={5}>
                    No rollups for the selected period.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Sales log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Date</th>
                <th className="py-2">Product</th>
                <th className="py-2">Units</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">Profit</th>
                <th className="py-2">Margin</th>
                <th className="py-2">Channel</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="py-2 pr-2">{entry.date}</td>
                  <td className="py-2 pr-2">{entry.productNameSnapshot}</td>
                  <td className="py-2 pr-2">{entry.unitsSold}</td>
                  <td className="py-2 pr-2">{entry.revenueUGX?.toLocaleString()}</td>
                  <td className="py-2 pr-2">{entry.profitUGX?.toLocaleString()}</td>
                  <td className="py-2 pr-2">{entry.marginBps}</td>
                  <td className="py-2 pr-2">{entry.channel || "-"}</td>
                </tr>
              ))}
              {data.entries.length === 0 ? (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={7}>
                    No sales entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
