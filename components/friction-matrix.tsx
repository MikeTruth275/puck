import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { frictions } from "@/lib/data"
import { cn } from "@/lib/utils"

export function FrictionMatrix() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Cross-Team Friction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {frictions.map((friction, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg border border-border p-2.5"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">{friction.team1}</span>
              <span className="text-muted-foreground">↔</span>
              <span className="font-medium">{friction.team2}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  friction.level === "high"
                    ? "bg-red-500"
                    : friction.level === "moderate"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium capitalize",
                  friction.level === "high"
                    ? "text-red-600 dark:text-red-400"
                    : friction.level === "moderate"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {friction.level}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
