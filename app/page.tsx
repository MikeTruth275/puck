"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BlufCard } from "@/components/bluf-card"
import { MetricsRow } from "@/components/metrics-row"
import { ChangesList } from "@/components/changes-list"
import { RisksList } from "@/components/risks-list"
import { FrictionMatrix } from "@/components/friction-matrix"
import { PMSignals } from "@/components/pm-signals"
import { ContextSignals } from "@/components/context-signals"
import { Recommendations } from "@/components/recommendations"
import { EvidenceDrawer } from "@/components/evidence-drawer"
import { BriefPreview } from "@/components/brief-preview"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PanelRightOpen, PanelRightClose, Loader2, AlertCircle } from "lucide-react"
import { useBriefData } from "@/hooks/use-brief-data"

export default function WeeklyBrief() {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedChange, setSelectedChange] = useState<string | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
  const [selectedPM, setSelectedPM] = useState<string | null>(null)

  const { data, state, error, lastUpdated, refresh } = useBriefData()

  const handleSelectChange = (id: string) => {
    setSelectedChange(id)
    setSelectedRisk(null)
    setSelectedPM(null)
    setDrawerOpen(true)
  }

  const handleSelectRisk = (id: string) => {
    setSelectedRisk(id)
    setSelectedChange(null)
    setSelectedPM(null)
    setDrawerOpen(true)
  }

  const handleSelectPM = (pm: string) => {
    setSelectedPM(pm)
    setSelectedChange(null)
    setSelectedRisk(null)
    setDrawerOpen(true)
  }

  const selectedItem = selectedChange || selectedRisk || selectedPM

  return (
    <>
      <Header state={state} lastUpdated={lastUpdated} onRefresh={refresh} />

      {state === "loading" && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-6 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Pulling live data from Jira and GitHub, synthesizing with Palmyra...
        </div>
      )}
      {state === "error" && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error || "Failed to load live data."} Showing cached/fallback data.
          <Button variant="outline" size="sm" className="ml-2 h-6 text-xs" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <BlufCard bluf={data.oneOnOneBrief.bluf} />
              <MetricsRow metrics={data.summaryMetrics} />

              <div className="flex justify-end lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="gap-2"
                >
                  {drawerOpen ? (
                    <>
                      <PanelRightClose className="h-4 w-4" />
                      Hide Evidence
                    </>
                  ) : (
                    <>
                      <PanelRightOpen className="h-4 w-4" />
                      Show Evidence
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <ChangesList
                    changes={data.changes}
                    onSelectChange={handleSelectChange}
                    selectedId={selectedChange}
                  />
                  <RisksList
                    risks={data.risks}
                    onSelectRisk={handleSelectRisk}
                    selectedId={selectedRisk}
                  />
                  <FrictionMatrix frictions={data.frictions} />
                </div>

                <div className="space-y-6">
                  <PMSignals
                    signals={data.pmSignals}
                    onSelectPM={handleSelectPM}
                    selectedPM={selectedPM}
                  />
                  <ContextSignals signals={data.contextSignals} />
                  <Recommendations recommendations={data.recommendations} />
                </div>
              </div>

              <BriefPreview brief={data.oneOnOneBrief} />
            </div>
          </div>
        </ScrollArea>

        <EvidenceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedItem={selectedItem}
          evidenceData={data.evidenceData}
        />
      </div>
    </>
  )
}
