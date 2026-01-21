import "server-only";

import { prisma } from "@/lib/db/prisma";
import { stackServerApp } from "@/stack";

export async function requireTeamContext(expectedTeamId?: string) {
  const user = await stackServerApp.getUser({ or: "throw" });
  if (!user?.selectedTeam && !expectedTeamId) {
    throw new Error("No team selected.");
  }

  let team = user.selectedTeam ?? null;
  if (expectedTeamId) {
    if (team?.id !== expectedTeamId) {
      const teams = await user.listTeams();
      const routeTeam = teams.find((candidate) => candidate.id === expectedTeamId) ?? null;
      if (!routeTeam) {
        throw new Error("Team access denied.");
      }
      await user.setSelectedTeam(routeTeam);
      team = routeTeam;
    }
  }

  if (!team) {
    throw new Error("No team selected.");
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: user.id,
      },
    },
    select: { id: true, role: true },
  });
  if (!membership) {
    throw new Error("Team membership required.");
  }

  return {
    user,
    team,
    teamId: team.id,
  };
}
