"use server";

import { prisma } from "@/lib/db/prisma";
import { requireTeamContext } from "@/lib/auth/team";
import { z } from "zod";

const settingsSchema = z.object({
  bakeryName: z.string().optional().nullable(),
  currency: z.string().min(1),
  defaultMarkupBps: z.number().int().nonnegative(),
  defaultOverheadMode: z.enum(["FLAT_UGX", "PERCENT_OF_SUBTOTAL"]),
  defaultOverheadValue: z.number().int().nonnegative(),
});

export async function getTeamSettings(teamId: string) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);
  const settings = await prisma.teamSettings.findUnique({
    where: { teamId: resolvedTeamId },
  });

  return (
    settings ?? {
      teamId: resolvedTeamId,
      bakeryName: null,
      currency: "UGX",
      defaultMarkupBps: 0,
      defaultOverheadMode: "FLAT_UGX",
      defaultOverheadValue: 0,
    }
  );
}

export async function updateTeamSettings(teamId: string, rawInput: unknown) {
  const { teamId: resolvedTeamId } = await requireTeamContext(teamId);
  const input = settingsSchema.parse(rawInput);

  return prisma.teamSettings.upsert({
    where: { teamId: resolvedTeamId },
    update: {
      bakeryName: input.bakeryName ?? null,
      currency: input.currency,
      defaultMarkupBps: input.defaultMarkupBps,
      defaultOverheadMode: input.defaultOverheadMode,
      defaultOverheadValue: input.defaultOverheadValue,
    },
    create: {
      teamId: resolvedTeamId,
      bakeryName: input.bakeryName ?? null,
      currency: input.currency,
      defaultMarkupBps: input.defaultMarkupBps,
      defaultOverheadMode: input.defaultOverheadMode,
      defaultOverheadValue: input.defaultOverheadValue,
    },
  });
}
