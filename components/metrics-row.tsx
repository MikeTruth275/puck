import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { summaryMetrics } from "@/lib/data"

export function MetricsRow() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {summaryMetrics.map((metric) => (
        <Card key={metric.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {metric.value}
                </p>
              </div>
              <div
                className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  metric.trend === "up"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    : metric.trend === "down"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {metric.delta}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
