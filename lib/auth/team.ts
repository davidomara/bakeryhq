import "server-only";

import { prisma } from "@/lib/db/prisma";
import { stackServerApp } from "@/stack";

export async function requireTeamContext(expectedTeamId?: string) {
  const user = await stackServerApp.getUser({ or: "throw" });
  if (!user?.selectedTeam) {
    throw new Error("No team selected.");
  }

  if (expectedTeamId && user.selectedTeam.id !== expectedTeamId) {
    throw new Error("Selected team does not match the route team.");
  }

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: user.selectedTeam.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      teamId: user.selectedTeam.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  return {
    user,
    team: user.selectedTeam,
    teamId: user.selectedTeam.id,
  };
}
