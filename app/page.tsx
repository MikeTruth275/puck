"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
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
import { PanelRightOpen, PanelRightClose } from "lucide-react"

export default function WeeklyBrief() {
  const [darkMode, setDarkMode] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedChange, setSelectedChange] = useState<string | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
  const [selectedPM, setSelectedPM] = useState<string | null>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main scrollable area */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="mx-auto max-w-6xl space-y-6">
                {/* BLUF Card */}
                <BlufCard />

                {/* Metrics Row */}
                <MetricsRow />

                {/* Toggle Evidence Drawer Button (Mobile/Tablet) */}
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

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <ChangesList
                      onSelectChange={handleSelectChange}
                      selectedId={selectedChange}
                    />
                    <RisksList
                      onSelectRisk={handleSelectRisk}
                      selectedId={selectedRisk}
                    />
                    <FrictionMatrix />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <PMSignals
                      onSelectPM={handleSelectPM}
                      selectedPM={selectedPM}
                    />
                    <ContextSignals />
                    <Recommendations />
                  </div>
                </div>

                {/* Brief Preview */}
                <BriefPreview />
              </div>
            </div>
          </ScrollArea>

          {/* Evidence Drawer */}
          <EvidenceDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            selectedItem={selectedItem}
          />
        </div>
      </div>
    </div>
  )
}
