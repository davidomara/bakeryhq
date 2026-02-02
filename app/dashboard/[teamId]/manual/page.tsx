export const metadata = {
  title: "User Manual",
  description: "BakeryHQ user manual",
};

export default async function ManualPage() {
  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-lg border bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">BakeryHQ User Manual</h1>
              <p className="text-sm text-muted-foreground">
                Quickstart + feature reference for staff and admins.
              </p>
            </div>
            <div className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
              Version 1.0
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-background p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Audience
            </div>
            <div className="mt-2 text-sm">
              Owners, admins, and staff managing costing, sales, and reports.
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What’s inside
            </div>
            <div className="mt-2 text-sm">
              Product costing, wedding cakes, sales log, exports, and settings.
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Need help
            </div>
            <div className="mt-2 text-sm">
              Contact your team admin or check the troubleshooting section.
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            App Navigation
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Product Costing",
              "View Costings",
              "Wedding Cakes",
              "View Wedding Costings",
              "Sales Summary",
              "Add Sale",
              "Settings",
              "Bakery Settings",
              "User Manual",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Quickstart (Everyone)</div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sign in and select your team (click Join team if prompted).</li>
              <li>Create a Product Costing using the step‑by‑step flow.</li>
              <li>Create a Wedding Cake Costing with at least one tier.</li>
              <li>Log a sale from Add Sale in the sidebar.</li>
              <li>Export XLSX from Product, Wedding, or Sales pages.</li>
            </ol>
          </div>
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Roles & Access</div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div><span className="font-medium text-foreground">Owner/Admin:</span> Full access to settings, costing, sales, and exports.</div>
              <div><span className="font-medium text-foreground">Staff:</span> Costing + sales access as assigned.</div>
              <div>If you cannot access a team, ask an Owner/Admin to add you.</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <div className="text-sm font-semibold">Product Costing (Single Product)</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Purpose</div>
              <div>Build a full cost breakdown and recommended selling price.</div>
              <div className="mt-3 font-medium text-foreground">Steps</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Ingredients (g, kg, ml, l, pcs; UGX integers)</li>
                <li>Packaging (boxes, labels, boards)</li>
                <li>Labor (hours × rate)</li>
                <li>Overhead (flat UGX or % of subtotal)</li>
                <li>Pricing (markup/target profit/target margin)</li>
                <li>Review & Save</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-foreground">Tips</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Use View Costings to search and reopen saved costings.</li>
                <li>Select a costing to edit it.</li>
                <li>Use Duplicate to copy an existing costing.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <div className="text-sm font-semibold">Wedding Cake Costing</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">Purpose</div>
              <div>Cost multi‑tier cakes using linked product costings or manual tier costs.</div>
              <div className="mt-3 font-medium text-foreground">Steps</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Client Details (name, event date, notes)</li>
                <li>Tiers (add at least one tier)</li>
                <li>Extras (delivery, topper, flowers)</li>
                <li>Pricing & Quote</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-foreground">Tips</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Use View Wedding Costings to reopen saved orders.</li>
                <li>Use Quote View for print‑friendly sharing.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <div className="text-sm font-semibold">Sales Summary (Monthly Profit)</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">How to use</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Add Sale: choose product, enter units + selling price, save.</li>
                <li>Sales Summary: filter by date/product/channel.</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-foreground">Calculations</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Revenue = units × selling price</li>
                <li>COGS = units × cost per unit</li>
                <li>Profit = revenue − COGS</li>
                <li>Margin (bps) = profit ÷ revenue</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Settings</div>
            <div className="mt-3 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Bakery Settings</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Bakery name</li>
                <li>Default currency (UGX)</li>
                <li>Default markup and overhead rules</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Exports (XLSX)</div>
            <div className="mt-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Product Costing</li>
                <li>Wedding Cake Costing</li>
                <li>Monthly Profit Summary</li>
              </ul>
              <div className="mt-2">Exports include computed values (no formulas).</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Troubleshooting</div>
            <div className="mt-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Team membership required: click Join team or ask an admin.</li>
                <li>Slow first load: initial compile may take a few seconds.</li>
                <li>Prices look wrong: check units (g vs kg, ml vs l).</li>
                <li>Build/server errors: confirm DATABASE_URL is set.</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-5">
            <div className="text-sm font-semibold">Glossary</div>
            <div className="mt-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>UGX: Ugandan Shilling</li>
                <li>BPS: Basis points (1% = 100 bps)</li>
                <li>COGS: Cost of Goods Sold</li>
                <li>Margin: Profit ÷ Revenue</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
