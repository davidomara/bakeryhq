import { z } from "zod";

export const ingredientUnitSchema = z.enum(["g", "kg", "ml", "l", "pcs"]);

export const ingredientLineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ingredient name is required"),
  qty: z.number().positive("Quantity must be greater than zero"),
  unit: ingredientUnitSchema,
  unitCostUGX: z.number().int().nonnegative("Unit cost must be 0 or higher"),
});

export const packagingLineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Packaging name is required"),
  costUGX: z.number().int().nonnegative("Cost must be 0 or higher"),
});

export const overheadSchema = z.object({
  mode: z.enum(["flatUGX", "percentOfSubtotal"]),
  value: z.number().int().nonnegative("Overhead must be 0 or higher"),
});

export const pricingSchema = z.object({
  markupBps: z.number().int().nonnegative().optional().nullable(),
  targetProfitUGX: z.number().int().nonnegative().optional().nullable(),
  targetMarginBps: z.number().int().nonnegative().max(9999).optional().nullable(),
  userSellingPriceUGX: z.number().int().nonnegative().optional().nullable(),
});

export const pricingModeSchema = z.enum([
  "MARKUP",
  "TARGET_PROFIT",
  "TARGET_MARGIN",
  "AUTO_RECOMMENDED",
]);

export const productCostingInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  notes: z.string().optional().nullable(),
  ingredients: z.array(ingredientLineSchema).min(1, "Add at least one ingredient"),
  packaging: z.array(packagingLineSchema),
  laborHours: z.number().nonnegative().optional().nullable(),
  laborRateUGXPerHour: z.number().int().nonnegative().optional().nullable(),
  overhead: overheadSchema,
  yieldUnits: z.number().int().positive().optional().nullable(),
  yieldUnitLabel: z.string().optional().nullable(),
  pricing: pricingSchema,
  pricingMode: pricingModeSchema.optional().default("AUTO_RECOMMENDED"),
});

export type ProductCostingInput = z.infer<typeof productCostingInputSchema>;

export const weddingTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tier name is required"),
  servings: z.number().int().positive().optional().nullable(),
  flavor: z.string().optional().nullable(),
  linkedProductCostingId: z.string().optional().nullable(),
  manualTierCostUGX: z.number().int().nonnegative().optional().nullable(),
});

export const weddingExtraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Extra name is required"),
  costUGX: z.number().int().nonnegative("Cost must be 0 or higher"),
});

export const weddingCostingInputSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tiers: z.array(weddingTierSchema).min(1, "Add at least one tier"),
  extras: z.array(weddingExtraSchema),
  pricing: pricingSchema,
});

export type WeddingCostingInput = z.infer<typeof weddingCostingInputSchema>;

export const salesEntryInputSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  productCostingId: z.string().optional().nullable(),
  productNameSnapshot: z.string().min(1, "Product name is required"),
  unitsSold: z.number().int().positive("Units sold must be greater than zero"),
  sellingPricePerUnitUGX: z.number().int().nonnegative("Selling price must be 0 or higher"),
  costPerUnitSnapshotUGX: z.number().int().nonnegative("Cost per unit must be 0 or higher"),
  channel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type SalesEntryInput = z.infer<typeof salesEntryInputSchema>;
