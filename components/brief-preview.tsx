"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Printer, ChevronRight } from "lucide-react"
import type { OneOnOneBrief } from "@/lib/api/types"

interface BriefPreviewProps {
  brief: OneOnOneBrief
}

export function BriefPreview({ brief }: BriefPreviewProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">1:1 Brief Preview</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            Tuesday with Waseem
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                BLUF
              </h4>
              <p className="mt-1 text-xs leading-relaxed">{brief.bluf}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Top 3 Signals
              </h4>
              <ul className="mt-1 space-y-1">
                {brief.topSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Biggest Risks
              </h4>
              <ul className="mt-1 space-y-1">
                {brief.biggestRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Recommendations
              </h4>
              <ul className="mt-1 space-y-1">
                {brief.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Calibrate with Waseem
              </h4>
              <ul className="mt-1 space-y-1">
                {brief.calibrationTopics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Cheat Sheet</span>
              </div>
              <Separator className="mb-3" />
              <div className="space-y-3 text-[10px]">
                <div>
                  <span className="font-medium text-muted-foreground">1. What changed?</span>
                  <p className="mt-0.5">{brief.topSignals.slice(0, 3).join(". ") || "See signals above."}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">2. What is at risk?</span>
                  <p className="mt-0.5">{brief.biggestRisks.join(". ") || "See risks above."}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">3. Recommendations?</span>
                  <p className="mt-0.5">{brief.recommendations.join(". ") || "See recommendations above."}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">4. Ask Waseem?</span>
                  <p className="mt-0.5">{brief.calibrationTopics.join(". ") || "See calibration topics above."}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button size="sm" className="flex-1 gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Generate Cheat Sheet
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
