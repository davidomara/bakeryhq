import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type RecentSaleEntry = {
  id: string
  productNameSnapshot: string
  revenueUGX: number
  date: string
  channel?: string | null
}

const avatarPool = ["01", "02", "03", "04", "05"]

export function RecentSales(props: { entries: RecentSaleEntry[] }) {
  return (
    <div className="space-y-8">
      {props.entries.map((entry, index) => {
        const avatarId = avatarPool[index % avatarPool.length]
        const initials = entry.productNameSnapshot
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()

        return (
          <div className="flex items-center" key={entry.id}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={`/avatars/${avatarId}.png`} alt="Avatar" />
              <AvatarFallback>{initials || "BK"}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {entry.productNameSnapshot}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.channel ? `${entry.channel} • ` : ""}
                {entry.date}
              </p>
            </div>
            <div className="ml-auto font-medium">
              UGX {entry.revenueUGX.toLocaleString()}
            </div>
          </div>
        )
      })}

      {props.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent sales yet.</p>
      ) : null}
    </div>
  )
}
