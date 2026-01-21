"use server";

import { prisma } from "@/lib/db/prisma";
import { stackServerApp } from "@/stack";

export async function createTeamMembership(teamId: string, role: "OWNER" | "ADMIN" | "STAFF" = "STAFF") {
  const user = await stackServerApp.getUser({ or: "throw" });
  const team = await user.getTeam(teamId);
  if (!team) {
    throw new Error("Team not found or access denied.");
  }

  return prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role,
    },
  });
}
