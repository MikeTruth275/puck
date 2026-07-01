import { NextResponse } from "next/server"
import { getBlockedItems, getAtRiskItems, getPortfolioEpics } from "@/lib/api/jira"

export async function GET() {
  try {
    const [blocked, atRisk, allEpics] = await Promise.all([
      getBlockedItems(),
      getAtRiskItems(),
      getPortfolioEpics(),
    ])

    // Deduplicate: some items may appear in both blocked and atRisk
    const seenKeys = new Set<string>()
    const deduped = [...blocked, ...atRisk].filter((e) => {
      if (seenKeys.has(e.key)) return false
      seenKeys.add(e.key)
      return true
    })

    // Categorize risks
    const blockedKeys = new Set(blocked.map((e) => e.key))
    const categorized = deduped.map((e) => {
      const reasons: string[] = []
      if (blockedKeys.has(e.key)) reasons.push("Blocked")
      if (!e.assignee) reasons.push("Unassigned")
      if (e.fixVersions.includes("Q1 2026") && e.status === "To Do") reasons.push("Q1 not started")
      const daysSinceUpdate = Math.floor((Date.now() - new Date(e.updated).getTime()) / 86400000)
      if (daysSinceUpdate >= 7 && e.priority === "Highest") reasons.push(`Stale ${daysSinceUpdate}d`)
      if (daysSinceUpdate >= 14 && e.priority === "High") reasons.push(`Stale ${daysSinceUpdate}d`)

      return { ...e, riskReasons: reasons }
    })

    // Summary stats
    const blockedByAssignee: Record<string, number> = {}
    for (const e of blocked) {
      const owner = e.assignee || "Unassigned"
      blockedByAssignee[owner] = (blockedByAssignee[owner] || 0) + 1
    }

    // Unassigned high-priority
    const unassignedHighPri = allEpics.filter(
      (e) => !e.assignee && ["Highest", "High"].includes(e.priority) && !["Done", "Won't Do / Cancelled"].includes(e.status)
    )

    // Q1 2026 epics still in To Do
    const q1NotStarted = allEpics.filter(
      (e) => e.fixVersions.includes("Q1 2026") && e.status === "To Do"
    )

    return NextResponse.json({
      risks: categorized,
      blocked,
      atRisk,
      unassignedHighPri,
      q1NotStarted,
      blockedByAssignee,
      summary: {
        totalRisks: categorized.length,
        blockedCount: blocked.length,
        unassignedHighPriCount: unassignedHighPri.length,
        q1NotStartedCount: q1NotStarted.length,
      },
    })
  } catch (err) {
    console.error("Risks API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Risks fetch failed" },
      { status: 500 }
    )
  }
}
