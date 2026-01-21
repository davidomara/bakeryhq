"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTeamSettings } from "@/app/dashboard/[teamId]/settings/actions";

export function SettingsPageClient({
  teamId,
  initialSettings,
}: {
  teamId: string;
  initialSettings: {
    bakeryName: string | null;
    currency: string;
    defaultMarkupBps: number;
    defaultOverheadMode: "FLAT_UGX" | "PERCENT_OF_SUBTOTAL";
    defaultOverheadValue: number;
  };
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      await updateTeamSettings(teamId, settings);
      setStatus("Settings updated.");
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Bakery Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage defaults used in costing templates.
        </p>
      </div>

      <section className="rounded-lg border p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Bakery name</label>
            <Input
              value={settings.bakeryName ?? ""}
              onChange={(event) =>
                setSettings({ ...settings, bakeryName: event.target.value })
              }
              placeholder="Bakery HQ"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Currency</label>
            <Input
              value={settings.currency}
              onChange={(event) =>
                setSettings({ ...settings, currency: event.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default markup (bps)</label>
            <Input
              type="number"
              value={settings.defaultMarkupBps}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  defaultMarkupBps: Number(event.target.value || 0),
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default overhead</label>
            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={settings.defaultOverheadMode}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    defaultOverheadMode: event.target.value as
                      | "FLAT_UGX"
                      | "PERCENT_OF_SUBTOTAL",
                  })
                }
              >
                <option value="FLAT_UGX">Flat UGX</option>
                <option value="PERCENT_OF_SUBTOTAL">% of subtotal</option>
              </select>
              <Input
                type="number"
                value={settings.defaultOverheadValue}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    defaultOverheadValue: Number(event.target.value || 0),
                  })
                }
              />
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save settings"}
        </Button>
        {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
      </section>
    </div>
  );
}
