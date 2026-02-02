# BakeryHQ User Manual

This guide covers daily use for staff and setup/administration for owners and admins. It includes a quickstart and a feature reference.

## Quickstart (Everyone)

1) Sign in and select your team.
- If you see **“Join team”**, click it once to create your membership.

2) Create a Product Costing
- Go to **Product Costing**.
- Follow the step-by-step flow: Ingredients → Packaging → Labor → Overhead → Pricing → Review & Save.
- Click **Save** on the final step.

3) Create a Wedding Cake Costing
- Go to **Wedding Cakes**.
- Add at least one tier, then proceed through Extras → Pricing → Quote → Save.

4) Log a Sale
- Go to **Sales Summary** to view rollups and logs.
- Go to **Add Sale** (sub‑item under Sales Summary) to add a sale.

5) Export to Excel
- Product costing: open a saved costing and click **Download XLSX**.
- Wedding costing: open a saved wedding costing and click **Download XLSX**.
- Sales summary: use filters then click **Download XLSX**.

## Roles & Access

BakeryHQ uses Stack Auth teams for tenancy. Your account must be a team member to access data.

- **Owner/Admin**: Full access to settings, costing, sales, and exports.
- **Staff**: Access to costing and sales, as assigned by your team.

If you cannot access a team, ask an Owner/Admin to add you.

## Product Costing (Single Product)

### Purpose
Calculate accurate product cost and suggested pricing using ingredients, packaging, labor, and overhead.

### Steps
1) **Ingredients**
   - Add each ingredient line with quantity and unit.
   - Units supported: g, kg, ml, l, pcs.
   - Costs are stored in UGX integers (no decimals).

2) **Packaging**
   - Add boxes, labels, boards, or other packaging costs.

3) **Labor**
   - Enter hours and rate per hour.

4) **Overhead**
   - Choose flat UGX or % of subtotal.

5) **Pricing**
   - Choose one or more inputs:
     - **Markup (bps)**: 1000 = 10%
     - **Target Profit (UGX)**
     - **Target Margin (bps)**
   - **Auto recommended** picks the highest valid price to avoid underpricing.

6) **Review & Save**
   - Confirm totals and save the costing.

### Tips
- Use **View Costings** to search and reopen saved costings.
- Selecting a costing opens it for editing.
- Use **Duplicate** to copy an existing costing.

## Wedding Cake Costing

### Purpose
Cost multi-tier cakes using linked product costings or manual tier costs.

### Steps
1) **Client Details**
   - Client name, event date, notes.

2) **Tiers**
   - Add at least one tier.
   - Link to a product costing or enter manual tier cost.

3) **Extras**
   - Add delivery, topper, flowers, stand, etc.

4) **Pricing & Quote**
   - Use the same pricing logic as product costing.
   - Review totals and save.

### Tips
- Use **View Wedding Costings** to search and reopen saved orders.
- Use **Quote View** for print-friendly sharing.

## Sales Summary (Monthly Profit)

### Purpose
Track revenue, cost of goods, and profit by month.

### How to use
1) **Add Sale**
   - Go to **Add Sale** in the sidebar.
   - Choose a product to auto-fill name and cost.
   - Enter units sold and selling price.
   - Save the sale.

2) **Sales Summary**
   - Filter by date range, product, or channel.
   - Review monthly rollups and the sales log.

### Calculations
- **Revenue** = units × selling price
- **COGS** = units × cost per unit
- **Profit** = revenue − COGS
- **Margin (bps)** = profit ÷ revenue

## Settings

### Bakery Settings
Owners/Admins can set:
- Bakery name
- Default currency (UGX)
- Default markup / overhead rules

## Exports (XLSX)

Available exports:
- Product Costing
- Wedding Cake Costing
- Monthly Profit Summary

Exports include **computed values** instead of formulas for reliability.

## Troubleshooting

**“Team membership required.”**
- Click **Join team** or ask an admin to add you.

**Slow first load**
- The first visit compiles routes and may take a few seconds.

**Prices look wrong**
- Check units (g vs kg, ml vs l) and ensure costs are in UGX integers.

**Build or server errors**
- Confirm `DATABASE_URL` is set correctly in your environment (local or Vercel).

## Glossary

- **UGX**: Ugandan Shilling.
- **BPS (basis points)**: 1% = 100 bps. Example: 2500 bps = 25%.
- **COGS**: Cost of Goods Sold.
- **Margin**: Profit ÷ Revenue.
