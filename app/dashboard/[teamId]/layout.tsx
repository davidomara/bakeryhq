import { requireTeamContext } from "@/lib/auth/team";
import { stackServerApp } from "@/stack";
import { JoinTeamClient } from "@/app/dashboard/[teamId]/join/join-team-client";
import DashboardShell from "@/app/dashboard/[teamId]/dashboard-shell";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  try {
    await requireTeamContext(teamId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Team membership required.") {
      const user = await stackServerApp.getUser({ or: "throw" });
      const team = await user.getTeam(teamId);
      if (!team) {
        throw new Error("Team access denied.");
      }
      const teamName =
        (team as { displayName?: string; name?: string }).displayName ??
        (team as { name?: string }).name ??
        "this team";
      return <JoinTeamClient teamId={teamId} teamName={teamName} />;
    }
    throw error;
  }

  return <DashboardShell teamId={teamId}>{children}</DashboardShell>;
}
