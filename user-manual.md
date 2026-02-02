# BakeryHQ User Manual

## Overview

BakeryHQ is a costing and profitability system for bakery teams. It helps you:
- Price products accurately
- Track monthly profit
- Produce client-ready wedding cake quotes
- Keep each team’s data isolated and secure

This manual is written for both **staff** and **owners/admins**.

---

## Quickstart (Everyone)

### 1) Sign in and select your team
- If you see **Join team**, click it once to create your membership.

### 2) Create a Product Costing
- Go to **Product Costing**.
- Complete the flow: **Ingredients → Packaging → Labor → Overhead → Pricing → Review & Save**.
- Click **Save** on the final step.

### 3) Create a Wedding Cake Costing
- Go to **Wedding Cakes**.
- Add at least one tier, then continue to **Extras → Pricing → Quote → Save**.

### 4) Log a Sale
- Go to **Sales Summary** for rollups.
- Go to **Add Sale** to record a sale.

### 5) Export to Excel
- Product costing: open a saved costing → **Download XLSX**.
- Wedding costing: open a saved wedding costing → **Download XLSX**.
- Sales summary: apply filters → **Download XLSX**.

---

## Roles & Access

BakeryHQ uses Stack Auth teams for tenancy. Your account must be a team member to access data.

| Role | Access |
| --- | --- |
| Owner/Admin | Full access to settings, costing, sales, exports |
| Staff | Costing + sales access as assigned |

If you cannot access a team, ask an Owner/Admin to add you.

---

## Product Costing (Single Product)

### Purpose
Build a full cost breakdown and recommended selling price.

### Steps
**Ingredients**
- Add each ingredient line with quantity + unit.
- Units supported: **g, kg, ml, l, pcs**.
- Costs are stored as **UGX integers** (no decimals).

**Packaging**
- Add boxes, labels, boards, and other packaging costs.

**Labor**
- Enter hours and hourly rate.

**Overhead**
- Choose **flat UGX** or **% of subtotal**.

**Pricing**
- Inputs (use one or more):
  - **Markup (bps)**: 1000 = 10%
  - **Target Profit (UGX)**
  - **Target Margin (bps)**
- **Auto recommended** chooses the highest valid price to avoid underpricing.

**Review & Save**
- Confirm totals, then save the costing.

### Tips
- Use **View Costings** to search and reopen saved costings.
- Select a costing to edit it.
- Use **Duplicate** to copy an existing costing.

---

## Wedding Cake Costing

### Purpose
Cost multi‑tier cakes using linked product costings or manual tier costs.

### Steps
**Client Details**
- Client name, event date, notes.

**Tiers**
- Add at least one tier.
- Link to a product costing or enter manual tier cost.

**Extras**
- Add delivery, topper, flowers, stand, etc.

**Pricing & Quote**
- Same pricing logic as product costing.
- Review totals and save.

### Tips
- Use **View Wedding Costings** to search and reopen saved orders.
- Use **Quote View** for print‑friendly sharing.

---

## Sales Summary (Monthly Profit)

### Purpose
Track revenue, COGS, and profit by month.

### How to use
**Add Sale**
- Go to **Add Sale** in the sidebar.
- Choose a product to auto‑fill name and cost.
- Enter units sold + selling price.
- Save.

**Sales Summary**
- Filter by date range, product, or channel.
- Review monthly rollups and sales log.

### Calculations
- **Revenue** = units × selling price
- **COGS** = units × cost per unit
- **Profit** = revenue − COGS
- **Margin (bps)** = profit ÷ revenue

---

## Settings

### Bakery Settings
Owners/Admins can set:
- Bakery name
- Default currency (UGX)
- Default markup and overhead rules

---

## Exports (XLSX)

Exports include:
- Product Costing
- Wedding Cake Costing
- Monthly Profit Summary

All exports use **computed values** (no formulas).

---

## Troubleshooting

**Team membership required**
- Click **Join team** or ask an admin to add you.

**Slow first load**
- First visit compiles routes and may take a few seconds.

**Prices look wrong**
- Check units (g vs kg, ml vs l) and ensure costs are UGX integers.

**Build or server errors**
- Confirm `DATABASE_URL` is set in your environment (local or Vercel).

---

## Glossary

- **UGX**: Ugandan Shilling
- **BPS**: Basis points (1% = 100 bps)
- **COGS**: Cost of Goods Sold
- **Margin**: Profit ÷ Revenue
