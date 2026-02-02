"use client";

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack";
import { CakeSlice, ClipboardList, Eye, LineChart, PlusSquare, Settings2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navigationItems: SidebarItem[] = [
  {
    name: "Overview",
    href: "/",
    icon: LineChart,
    type: "item",
  },
  {
    type: "label",
    name: "Costing",
  },
  {
    name: "Product Costing",
    href: "/costing",
    icon: ClipboardList,
    type: "item",
  },
  {
    name: "View Costings",
    href: "/costing/view",
    icon: Eye,
    type: "item",
    indent: true,
  },
  {
    name: "Wedding Cakes",
    href: "/wedding-cakes",
    icon: CakeSlice,
    type: "item",
  },
  {
    name: "View Wedding Costings",
    href: "/wedding-cakes/view",
    icon: Eye,
    type: "item",
    indent: true,
  },
  {
    name: "Sales Summary",
    href: "/sales",
    icon: LineChart,
    type: "item",
  },
  {
    name: "Add Sale",
    href: "/sales/new",
    icon: PlusSquare,
    type: "item",
    indent: true,
  },
  {
    type: "label",
    name: "Settings",
  },
  {
    name: "Bakery Settings",
    href: "/settings",
    icon: Settings2,
    type: "item",
  },
  {
    name: "User Manual",
    href: "/manual",
    icon: BookOpenText,
    type: "item",
  },
];

export default function DashboardShell({
  teamId,
  children,
}: {
  teamId: string;
  children: React.ReactNode;
}) {
  const user = useUser({ or: "redirect" });
  const teams = user.useTeams();
  const team = user.useTeam(teamId);
  const router = useRouter();

  useEffect(() => {
    if (teams.length > 0 && !team) {
      router.push("/dashboard");
    }
  }, [teams.length, team, router]);

  if (!team) {
    return null;
  }

  return (
    <SidebarLayout
      items={navigationItems}
      basePath={`/dashboard/${team.id}`}
      sidebarTop={
        <SelectedTeamSwitcher
          selectedTeam={team}
          urlMap={(selected) => `/dashboard/${selected.id}`}
        />
      }
      baseBreadcrumb={[
        {
          title: team.displayName,
          href: `/dashboard/${team.id}`,
        },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}
