import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Clock, MessageSquare, FileText } from "lucide-react"
import { contextSignals } from "@/lib/data"
import { cn } from "@/lib/utils"

const typeIcons: Record<string, typeof RefreshCw> = {
  "Manual Updates": RefreshCw,
  "Stale Context": Clock,
  "Fragmented Comms": MessageSquare,
  "Missing Artifacts": FileText,
}

export function ContextSignals() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Context Propagation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contextSignals.map((signal, idx) => {
          const Icon = typeIcons[signal.type] || RefreshCw
          return (
            <div
              key={idx}
              className="rounded-lg border border-border p-2.5"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{signal.type}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        signal.impact === "High"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {signal.impact}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {signal.description}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-foreground">
                    → {signal.opportunity}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
