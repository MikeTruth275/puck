import { NextResponse } from "next/server"
import { getPortfolioEpics, getBlockedItems, getRecentlyShipped } from "@/lib/api/jira"
import { getMergedPRs } from "@/lib/api/github"
import { PM_ROSTER, matchPM } from "@/lib/api/pm-mapping"

export async function GET() {
  try {
    const [epics, blocked, shipped, mergedPRs] = await Promise.all([
      getPortfolioEpics(),
      getBlockedItems(),
      getRecentlyShipped(),
      getMergedPRs(14),
    ])

    const blockedKeys = new Set(blocked.map((e) => e.key))

    const pmSignals = PM_ROSTER.map((pm) => {
      const ownedEpics = epics.filter((e) => matchPM(e) === pm.name)
      const ownedBlocked = ownedEpics.filter((e) => blockedKeys.has(e.key))
      const ownedShipped = shipped.filter((e) => matchPM(e) === pm.name)
      const ownedInProgress = ownedEpics.filter((e) => e.status === "In Progress")
      const ownedToDo = ownedEpics.filter((e) => e.status === "To Do")
      const ownedUnassignedSubs = ownedEpics.filter((e) => !e.assignee)

      // Q1 health
      const q1Epics = ownedEpics.filter((e) => e.fixVersions.includes("Q1 2026"))
      const q1Done = q1Epics.filter((e) => ["Done", "In Prod"].includes(e.status))
      const q1Blocked = q1Epics.filter((e) => blockedKeys.has(e.key))

      // Staleness: epics not updated in 14+ days
      const staleEpics = ownedEpics.filter((e) => {
        const days = (Date.now() - new Date(e.updated).getTime()) / 86400000
        return days >= 14 && !["Done", "Won't Do / Cancelled"].includes(e.status)
      })

      // GitHub activity: PRs that reference Jira keys this PM owns
      const ownedKeys = new Set(ownedEpics.map((e) => e.key))
      const linkedPRs = mergedPRs.filter((pr) => pr.jiraKeys.some((k) => ownedKeys.has(k)))

      // Compute raw scores (0-100)
      const totalActive = ownedInProgress.length + ownedToDo.length + ownedBlocked.length
      const commitmentIntegrity = totalActive > 0
        ? Math.round(((ownedInProgress.length + ownedShipped.length) / Math.max(totalActive, 1)) * 100)
        : 50
      const varianceFromPlan = q1Epics.length > 0
        ? Math.round(((q1Done.length) / q1Epics.length) * 100)
        : 50
      const dependencyHealth = totalActive > 0
        ? Math.round(Math.max(0, 100 - (ownedBlocked.length / Math.max(totalActive, 1)) * 200))
        : 80
      const executionControl = totalActive > 0
        ? Math.round(Math.max(0, 100 - (staleEpics.length / Math.max(totalActive, 1)) * 150))
        : 50
      const communicationQuality = Math.min(100, Math.round(50 + linkedPRs.length * 3))
      const strategicAltitude = q1Epics.length > 0
        ? Math.min(100, Math.round(40 + q1Epics.length * 5 + ownedShipped.length * 10))
        : 40

      return {
        pm: pm.name,
        initiative: pm.initiative,
        scores: {
          commitmentIntegrity: Math.min(100, Math.max(0, commitmentIntegrity)),
          varianceFromPlan: Math.min(100, Math.max(0, varianceFromPlan)),
          communicationQuality: Math.min(100, Math.max(0, communicationQuality)),
          dependencyHealth: Math.min(100, Math.max(0, dependencyHealth)),
          executionControl: Math.min(100, Math.max(0, executionControl)),
          strategicAltitude: Math.min(100, Math.max(0, strategicAltitude)),
        },
        breakdown: {
          totalEpics: ownedEpics.length,
          inProgress: ownedInProgress.length,
          toDo: ownedToDo.length,
          blocked: ownedBlocked.length,
          shipped: ownedShipped.length,
          stale: staleEpics.length,
          q1Total: q1Epics.length,
          q1Done: q1Done.length,
          q1Blocked: q1Blocked.length,
          linkedPRs: linkedPRs.length,
        },
        epics: ownedEpics,
        blockedEpics: ownedBlocked,
        staleEpics,
        shippedEpics: ownedShipped,
      }
    })

    return NextResponse.json({ pmSignals })
  } catch (err) {
    console.error("PM Signals API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PM Signals fetch failed" },
      { status: 500 }
    )
  }
}
