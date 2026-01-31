import { Metadata } from "next";

import { RecentSales } from "@/app/dashboard/[teamId]/(overview)/recent-sales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Graph } from "./graph";
import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";
import { computeMarginBps } from "@/lib/costing/calculations";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "BakeryHQ overview with costing and profit highlights.",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  await requireTeamContext(teamId);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [monthlySales, monthlySalesCount, costingCount, recentSales] =
    await Promise.all([
      prisma.salesEntry.findMany({
        where: { teamId, date: { gte: startOfMonth } },
        select: { revenueUGX: true, profitUGX: true },
      }),
      prisma.salesEntry.count({
        where: { teamId, date: { gte: startOfMonth } },
      }),
      prisma.productCosting.count({ where: { teamId } }),
      prisma.salesEntry.findMany({
        where: { teamId },
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          productNameSnapshot: true,
          revenueUGX: true,
          date: true,
          channel: true,
        },
      }),
    ]);

  const monthlyRevenueUGX = monthlySales.reduce(
    (sum, entry) => sum + entry.revenueUGX,
    0
  );
  const monthlyProfitUGX = monthlySales.reduce(
    (sum, entry) => sum + entry.profitUGX,
    0
  );
  const avgMarginBps = computeMarginBps(monthlyRevenueUGX, monthlyProfitUGX);

  const salesWindow = await prisma.salesEntry.findMany({
    where: { teamId, date: { gte: startWindow } },
    select: { date: true, revenueUGX: true },
  });

  const monthlyMap = new Map<string, number>();
  for (let i = 0; i < 6; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyMap.set(key, 0);
  }
  salesWindow.forEach((entry) => {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + entry.revenueUGX);
  });

  const chartData = Array.from(monthlyMap.entries()).map(([key, total]) => {
    const [year, month] = key.split("-").map(Number);
    const label = new Date(year, month, 1).toLocaleString("en-US", {
      month: "short",
    });
    return { name: label, total };
  });

  const recentEntries = recentSales.map((entry) => ({
    id: entry.id,
    productNameSnapshot: entry.productNameSnapshot,
    revenueUGX: entry.revenueUGX,
    date: entry.date.toISOString().slice(0, 10),
    channel: entry.channel,
  }));

  return (
    <>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  UGX {monthlyRevenueUGX.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month’s revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Costing Templates
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{costingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total saved products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Orders Logged
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlySalesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Logged this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Margin
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(avgMarginBps / 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Profit margin this month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Graph data={chartData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest activity from your sales log.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales entries={recentEntries} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
