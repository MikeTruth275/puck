import { NextResponse } from "next/server"
import { getPortfolioEpics } from "@/lib/api/jira"
import { getRepoActivity } from "@/lib/api/github"

export async function GET() {
  try {
    const [epics, repoActivity] = await Promise.all([
      getPortfolioEpics(),
      getRepoActivity(14),
    ])

    // Group by initiative/assignee for the portfolio view
    const byAssignee: Record<string, typeof epics> = {}
    for (const e of epics) {
      const owner = e.assignee || "Unassigned"
      if (!byAssignee[owner]) byAssignee[owner] = []
      byAssignee[owner].push(e)
    }

    // Status summary
    const statusCounts: Record<string, number> = {}
    const priorityCounts: Record<string, number> = {}
    const projectCounts: Record<string, number> = {}
    for (const e of epics) {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
      priorityCounts[e.priority] = (priorityCounts[e.priority] || 0) + 1
      const proj = e.key.split("-")[0]
      projectCounts[proj] = (projectCounts[proj] || 0) + 1
    }

    return NextResponse.json({
      epics,
      byAssignee,
      statusCounts,
      priorityCounts,
      projectCounts,
      repoActivity,
      totalCount: epics.length,
    })
  } catch (err) {
    console.error("Portfolio API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portfolio fetch failed" },
      { status: 500 }
    )
  }
}
