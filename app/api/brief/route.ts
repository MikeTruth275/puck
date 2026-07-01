import { NextResponse } from "next/server"
import { getAllPortfolioData } from "@/lib/api/jira"
import { getAllGitHubData } from "@/lib/api/github"
import { getAllConfluenceData } from "@/lib/api/confluence"
import { synthesizeBrief } from "@/lib/api/synthesize"
import { pms } from "@/lib/data"
import type { WeeklyBriefData } from "@/lib/api/types"

export async function GET() {
  try {
    const [jira, github, confluence] = await Promise.all([
      getAllPortfolioData(),
      getAllGitHubData(),
      getAllConfluenceData(),
    ])

    const synthesized = await synthesizeBrief({ jira, github, confluence })

    // Build evidence data from raw sources -- show most recently updated epics in the drawer
    const evidenceJira = jira.portfolioEpics
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 20)
      .map((e) => ({
      id: e.key,
      title: e.summary,
      status: e.status,
      updated: new Date(e.updated).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      assignee: e.assignee || "Unassigned",
      description: `${e.issueType} | Priority: ${e.priority} | Fix Versions: ${e.fixVersions.join(", ") || "None"}`,
    }))

    const evidenceGithub = github.repoActivity.map((r) => ({
      repo: r.repo,
      prs: r.totalPRs,
      merged: r.mergedPRs,
      open: r.openPRs,
      activity: r.activity,
      lastCommit: r.lastCommit
        ? formatRelativeTime(new Date(r.lastCommit))
        : "unknown",
    }))

    const briefData: WeeklyBriefData = {
      pms,
      summaryMetrics: synthesized.summaryMetrics,
      changes: synthesized.changes,
      risks: synthesized.risks,
      frictions: synthesized.frictions,
      pmSignals: synthesized.pmSignals,
      contextSignals: synthesized.contextSignals,
      recommendations: synthesized.recommendations,
      oneOnOneBrief: synthesized.oneOnOneBrief,
      evidenceData: {
        jira: evidenceJira,
        github: evidenceGithub,
        slack: [],
        docs: confluence.recentPages.map((p) => ({
          title: p.title,
          lastUpdated: p.lastModified
            ? new Date(p.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "recently",
          status: p.status,
          owner: "",
        })),
      },
    }

    return NextResponse.json(briefData)
  } catch (err) {
    console.error("Brief generation error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Brief generation failed" },
      { status: 500 }
    )
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}
