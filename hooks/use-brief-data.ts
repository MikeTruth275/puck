"use client"

import { useState, useEffect, useCallback } from "react"
import type { WeeklyBriefData } from "@/lib/api/types"
import * as staticData from "@/lib/data"

type LoadingState = "idle" | "loading" | "success" | "error"

interface UseBriefDataReturn {
  data: WeeklyBriefData
  state: LoadingState
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

// Build fallback from static data so the UI always has something to show
const fallbackData: WeeklyBriefData = {
  pms: staticData.pms,
  summaryMetrics: staticData.summaryMetrics as WeeklyBriefData["summaryMetrics"],
  changes: staticData.changes as WeeklyBriefData["changes"],
  risks: staticData.risks as WeeklyBriefData["risks"],
  frictions: staticData.frictions as WeeklyBriefData["frictions"],
  pmSignals: staticData.pmSignals as WeeklyBriefData["pmSignals"],
  contextSignals: staticData.contextSignals as WeeklyBriefData["contextSignals"],
  recommendations: staticData.recommendations,
  oneOnOneBrief: staticData.oneOnOneBrief,
  evidenceData: staticData.evidenceData as WeeklyBriefData["evidenceData"],
}

export function useBriefData(): UseBriefDataReturn {
  const [data, setData] = useState<WeeklyBriefData>(fallbackData)
  const [state, setState] = useState<LoadingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBrief = useCallback(async () => {
    setState("loading")
    setError(null)

    try {
      const res = await fetch("/api/brief")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `API returned ${res.status}`)
      }

      const briefData: WeeklyBriefData = await res.json()
      setData(briefData)
      setState("success")
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch brief:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("error")
      // Keep showing whatever data we have (static fallback or last successful fetch)
    }
  }, [])

  useEffect(() => {
    fetchBrief()
  }, [fetchBrief])

  return { data, state, error, lastUpdated, refresh: fetchBrief }
}
