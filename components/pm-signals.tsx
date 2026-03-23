"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { pmSignals } from "@/lib/data"
import { cn } from "@/lib/utils"

const scoreLabels: Record<string, string> = {
  commitmentIntegrity: "Commitment",
  varianceFromPlan: "Variance",
  communicationQuality: "Comms",
  dependencyHealth: "Deps",
  executionControl: "Execution",
  strategicAltitude: "Strategy",
}

interface PMSignalsProps {
  onSelectPM: (pm: string) => void
  selectedPM: string | null
}

export function PMSignals({ onSelectPM, selectedPM }: PMSignalsProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">PM Operating Signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pmSignals.map((signal) => (
          <button
            key={signal.pm}
            onClick={() => onSelectPM(signal.pm)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-all hover:border-foreground/20 hover:bg-muted/50",
              selectedPM === signal.pm
                ? "border-foreground/20 bg-muted/50 ring-1 ring-foreground/10"
                : "border-border"
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs">
                  {signal.pm.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{signal.pm}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {signal.initiative}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-6 gap-1">
                  {Object.entries(signal.scores).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            value >= 80
                              ? "bg-emerald-500"
                              : value >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="mt-1 text-[8px] text-muted-foreground">
                        {scoreLabels[key]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                  {signal.interpretation}
                </p>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
