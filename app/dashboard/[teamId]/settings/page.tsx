import { getTeamSettings } from "@/app/dashboard/[teamId]/settings/actions";
import { SettingsPageClient } from "@/app/dashboard/[teamId]/settings/page-client";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const settings = await getTeamSettings(teamId);

  return <SettingsPageClient teamId={teamId} initialSettings={settings} />;
}
