import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, GitBranch, Clock, BarChart3 } from "lucide-react"

const statusChips = [
  { icon: GitBranch, label: "Scope Drift", status: "watch" },
  { icon: Clock, label: "Timeline Risk", status: "elevated" },
  { icon: AlertTriangle, label: "Coordination", status: "stable" },
  { icon: BarChart3, label: "Confidence", status: "stable" },
]

interface BlufCardProps {
  bluf?: string
}

export function BlufCard({ bluf }: BlufCardProps) {
  const displayText = bluf || "Portfolio trending stable with one high-priority escalation needed. Enterprise Brain dependency threatens Writer Agent launch date. AIRR scope may not match customer expectations -- proactive Sales alignment recommended. MCP velocity risk emerging but containable."

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Bottom Line
              </h2>
              <Badge 
                variant="outline" 
                className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
              >
                Watch
              </Badge>
            </div>
            <p className="text-base leading-relaxed text-foreground">
              {displayText}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusChips.map((chip) => (
              <div
                key={chip.label}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  chip.status === "elevated"
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                    : chip.status === "watch"
                    ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                }`}
              >
                <chip.icon className="h-3 w-3" />
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
