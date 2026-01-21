import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { listSalesData } from "@/app/dashboard/[teamId]/sales/actions";
import { requireTeamContext } from "@/lib/auth/team";

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = params;
  await requireTeamContext(teamId);

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const productCostingId = searchParams.get("productCostingId");
  const channel = searchParams.get("channel");

  const data = await listSalesData(teamId, {
    startDate: startDate || null,
    endDate: endDate || null,
    productCostingId: productCostingId || null,
    channel: channel || null,
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Monthly Profit Summary");

  sheet.addRow(["Monthly Profit Summary"]);
  sheet.addRow([]);

  sheet.addRow(["Monthly Rollups"]);
  sheet.addRow(["Month", "Revenue", "COGS", "Profit", "Avg Margin (bps)"]);
  data.monthlyRollups.forEach((row) => {
    sheet.addRow([
      row.month,
      row.totalRevenueUGX,
      row.totalCogsUGX,
      row.totalProfitUGX,
      row.avgMarginBps,
    ]);
  });

  sheet.addRow([]);
  sheet.addRow(["Sales Log"]);
  sheet.addRow([
    "Date",
    "Product",
    "Units",
    "Selling Price",
    "Cost per Unit",
    "Revenue",
    "COGS",
    "Profit",
    "Channel",
  ]);

  data.entries.forEach((entry) => {
    sheet.addRow([
      entry.date,
      entry.productNameSnapshot,
      entry.unitsSold,
      entry.sellingPricePerUnitUGX,
      entry.costPerUnitSnapshotUGX,
      entry.revenueUGX,
      entry.cogsUGX,
      entry.profitUGX,
      entry.channel ?? "",
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=monthly-profit-summary.xlsx",
    },
  });
}
