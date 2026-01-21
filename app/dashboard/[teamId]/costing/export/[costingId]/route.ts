import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string; costingId: string } }
) {
  const { teamId, costingId } = params;
  await requireTeamContext(teamId);

  const costing = await prisma.productCosting.findFirst({
    where: { id: costingId, teamId },
    include: { ingredientLines: true, packagingLines: true },
  });

  if (!costing) {
    return new Response("Not found", { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Costing Template");

  sheet.addRow(["Product Costing"]);
  sheet.addRow(["Name", costing.name]);
  sheet.addRow(["Yield", costing.yieldUnits ?? "", costing.yieldUnitLabel ?? ""]);
  sheet.addRow(["Notes", costing.notes ?? ""]);
  sheet.addRow([]);

  sheet.addRow(["Ingredients"]);
  sheet.addRow(["Ingredient", "Qty", "Unit", "Unit Cost (UGX)", "Line Cost (UGX)"]);
  costing.ingredientLines.forEach((line) => {
    sheet.addRow([
      line.name,
      Number(line.qty),
      line.unit,
      line.unitCostUGX,
      line.lineCostUGX,
    ]);
  });
  sheet.addRow([]);

  sheet.addRow(["Packaging"]);
  sheet.addRow(["Item", "Cost (UGX)"]);
  costing.packagingLines.forEach((line) => {
    sheet.addRow([line.name, line.costUGX]);
  });
  sheet.addRow([]);

  sheet.addRow(["Labor"]);
  sheet.addRow(["Hours", costing.laborHours ? Number(costing.laborHours) : ""]);
  sheet.addRow(["Rate (UGX/hr)", costing.laborRateUGXPerHour ?? ""]);
  sheet.addRow(["Labor Cost (UGX)", costing.laborCostUGX ?? ""]);
  sheet.addRow([]);

  sheet.addRow(["Overhead"]);
  sheet.addRow(["Mode", costing.overheadMode]);
  sheet.addRow(["Value", costing.overheadValue]);
  sheet.addRow(["Overhead (UGX)", costing.overheadUGX]);
  sheet.addRow([]);

  sheet.addRow(["Totals"]);
  sheet.addRow(["Subtotal (UGX)", costing.subtotalUGX]);
  sheet.addRow(["Total Cost (UGX)", costing.totalCostUGX]);
  sheet.addRow(["Cost per Unit (UGX)", costing.costPerUnitUGX ?? ""]);
  sheet.addRow([]);

  sheet.addRow(["Pricing"]);
  sheet.addRow(["Pricing Mode", costing.pricingMode]);
  sheet.addRow(["Markup (bps)", costing.markupBps ?? ""]);
  sheet.addRow(["Target Profit (UGX)", costing.targetProfitUGX ?? ""]);
  sheet.addRow(["Target Margin (bps)", costing.targetMarginBps ?? ""]);
  sheet.addRow(["Auto Recommended (UGX)", costing.autoRecommendedPriceUGX ?? ""]);
  sheet.addRow(["Selling Price (UGX)", costing.userSellingPriceUGX ?? ""]);

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="product-costing-${costing.id}.xlsx"`,
    },
  });
}
