"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Link2, DollarSign, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Risk } from "@/lib/api/types"

const categoryIcons: Record<string, typeof AlertTriangle> = {
  Dependency: Link2,
  Resource: AlertTriangle,
  Strategic: Target,
  Financial: DollarSign,
}

interface RisksListProps {
  risks: Risk[]
  onSelectRisk: (id: string) => void
  selectedId: string | null
}

export function RisksList({ risks, onSelectRisk, selectedId }: RisksListProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Key Risks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => {
          const Icon = categoryIcons[risk.category] || AlertTriangle
          return (
            <button
              key={risk.id}
              onClick={() => onSelectRisk(risk.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/50",
                selectedId === risk.id
                  ? "border-foreground/20 bg-muted/50 ring-1 ring-foreground/10"
                  : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    risk.impact === "High"
                      ? "bg-red-50 dark:bg-red-950"
                      : "bg-amber-50 dark:bg-amber-950"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      risk.impact === "High"
                        ? "text-red-600 dark:text-red-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{risk.title}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px]",
                        risk.impact === "High"
                          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      )}
                    >
                      {risk.impact} Impact
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {risk.interpretation}
                  </p>
                  <div className="mt-2 rounded-lg bg-muted/50 p-2">
                    <p className="text-xs font-medium text-foreground">
                      {risk.recommendation}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {risk.owner} · {risk.initiative}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {risk.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
