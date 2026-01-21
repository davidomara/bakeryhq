import { getTeamSettings } from "@/app/dashboard/[teamId]/settings/actions";
import { SettingsPageClient } from "@/app/dashboard/[teamId]/settings/page-client";

export default async function SettingsPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const settings = await getTeamSettings(teamId);

  return <SettingsPageClient teamId={teamId} initialSettings={settings} />;
}
