'use client';

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack";
import { CakeSlice, ClipboardList, LineChart, Settings2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

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
    icon: ClipboardList,
    type: "item",
  },
  {
    name: "Wedding Cakes",
    href: "/wedding-cakes",
    icon: CakeSlice,
    type: "item",
  },
  {
    name: "Sales Summary",
    href: "/sales",
    icon: LineChart,
    type: "item",
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
];

export default function Layout(props: { children: React.ReactNode }) {
  const params = useParams<{ teamId: string }>();
  const user = useUser({ or: 'redirect' });
  const teams = user.useTeams();
  const team = user.useTeam(params.teamId);
  const router = useRouter();

  useEffect(() => {
    if (teams.length > 0 && !team) {
      router.push('/dashboard');
    }
  }, [teams.length, team, router]);

  if (!team) {
    return null;
  }

  return (
    <SidebarLayout 
      items={navigationItems}
      basePath={`/dashboard/${team.id}`}
      sidebarTop={<SelectedTeamSwitcher 
        selectedTeam={team}
        urlMap={(team) => `/dashboard/${team.id}`}
      />}
      baseBreadcrumb={[{
        title: team.displayName,
        href: `/dashboard/${team.id}`,
      }]}
    >
      {props.children}
    </SidebarLayout>
  );
}
