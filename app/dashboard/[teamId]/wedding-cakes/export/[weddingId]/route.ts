import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string; weddingId: string } }
) {
  const { teamId, weddingId } = params;
  await requireTeamContext(teamId);

  const costing = await prisma.weddingCosting.findFirst({
    where: { id: weddingId, teamId },
    include: { tiers: true, extras: true },
  });

  if (!costing) {
    return new Response("Not found", { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Wedding Cake Costing");

  sheet.addRow(["Wedding Cake Costing"]);
  sheet.addRow(["Client", costing.clientName ?? ""]);
  sheet.addRow(["Event Date", costing.eventDate ? costing.eventDate.toISOString().slice(0, 10) : ""]);
  sheet.addRow(["Notes", costing.notes ?? ""]);
  sheet.addRow([]);

  sheet.addRow(["Tiers"]);
  sheet.addRow(["Tier", "Servings", "Flavor", "Linked Product", "Tier Cost (UGX)"]);
  costing.tiers.forEach((tier) => {
    const tierCost = tier.tierCostSnapshotUGX ?? tier.manualTierCostUGX ?? 0;
    sheet.addRow([
      tier.name,
      tier.servings ?? "",
      tier.flavor ?? "",
      tier.linkedProductCostingId ?? "Manual",
      tierCost,
    ]);
  });
  sheet.addRow([]);

  sheet.addRow(["Extras"]);
  sheet.addRow(["Extra", "Cost (UGX)"]);
  costing.extras.forEach((extra) => {
    sheet.addRow([extra.name, extra.costUGX]);
  });
  sheet.addRow([]);

  sheet.addRow(["Totals"]);
  sheet.addRow(["Total Cost (UGX)", costing.totalCostUGX]);
  sheet.addRow(["Cost per Serving (UGX)", costing.costPerServingUGX ?? ""]);
  sheet.addRow([]);

  sheet.addRow(["Pricing"]);
  sheet.addRow(["Markup (bps)", costing.markupBps ?? ""]);
  sheet.addRow(["Target Profit (UGX)", costing.targetProfitUGX ?? ""]);
  sheet.addRow(["Target Margin (bps)", costing.targetMarginBps ?? ""]);
  sheet.addRow(["Auto Recommended (UGX)", costing.autoRecommendedPriceUGX ?? ""]);
  sheet.addRow(["Quoted Price (UGX)", costing.userSellingPriceUGX ?? ""]);

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="wedding-costing-${costing.id}.xlsx"`,
    },
  });
}
