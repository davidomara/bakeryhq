"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTeamMembership } from "@/app/dashboard/[teamId]/memberships/actions";

export function JoinTeamClient({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    setStatus("");
    startTransition(async () => {
      try {
        await createTeamMembership(teamId, "STAFF");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(message || "Failed to join team.");
      }
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-lg space-y-4 rounded-lg border bg-background p-6 text-center">
        <div className="text-2xl font-semibold">Join {teamName}</div>
        <p className="text-sm text-muted-foreground">
          You have access to this team in Stack Auth, but you are not a member in the
          BakeryHQ database yet. Join the team to continue.
        </p>
        {status ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {status}
          </div>
        ) : null}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={handleJoin} disabled={isPending}>
            {isPending ? "Joining..." : "Join team"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Switch team
          </Button>
        </div>
      </div>
    </div>
  );
}
