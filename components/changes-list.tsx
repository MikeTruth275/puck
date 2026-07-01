"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Scissors, GitBranch, User, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Change } from "@/lib/api/types"

const categoryIcons: Record<string, typeof Calendar> = {
  schedule: Calendar,
  scope: Scissors,
  dependency: GitBranch,
  ownership: User,
  risk: AlertCircle,
}

interface ChangesListProps {
  changes: Change[]
  onSelectChange: (id: string) => void
  selectedId: string | null
}

export function ChangesList({ changes, onSelectChange, selectedId }: ChangesListProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">What Changed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {changes.map((change) => {
          const Icon = categoryIcons[change.category] || Calendar
          return (
            <button
              key={change.id}
              onClick={() => onSelectChange(change.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/50",
                selectedId === change.id
                  ? "border-foreground/20 bg-muted/50 ring-1 ring-foreground/10"
                  : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{change.initiative}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {change.changeType}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{change.before}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate font-medium text-foreground">{change.after}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {change.whyItMatters}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{change.pm}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        change.confidence === "High"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      )}
                    >
                      {change.confidence}
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
