import { getAllPortfolioData } from "@/lib/api/jira"
import { getAllGitHubData } from "@/lib/api/github"
import { getAllConfluenceData } from "@/lib/api/confluence"

export async function getPuckDataJsonForPrompt(): Promise<string> {
  const [jira, github, confluence] = await Promise.all([
    getAllPortfolioData(),
    getAllGitHubData(),
    getAllConfluenceData(),
  ])

  const blockedHighPri = jira.blockedItems.filter((e) =>
    ["Highest", "High"].includes(e.priority)
  )

  const activeEpics = jira.portfolioEpics.filter((e) =>
    ["In Progress", "BLOCKED", "QA Review"].includes(e.status)
  )

  const q1Epics = jira.portfolioEpics.filter((e) =>
    e.fixVersions.includes("Q1 2026")
  )
  const q1Done = q1Epics.filter((e) => e.statusCategory === "Done")

  const context = {
    snapshot: {
      totalEpics: jira.portfolioEpics.length,
      activeEpics: activeEpics.length,
      blockedTotal: jira.blockedItems.length,
      blockedHighPriority: blockedHighPri.length,
      recentlyShipped: jira.recentlyShipped.length,
      q1Progress: { done: q1Done.length, total: q1Epics.length },
      prsMerged7d: github.mergedPRs.length,
      confluencePages: confluence.totalRecentPages,
      confluenceMeetingNotes: confluence.totalMeetingNotes,
    },
    blockedItems: jira.blockedItems.slice(0, 40).map((e) => ({
      key: e.key,
      summary: e.summary,
      assignee: e.assignee,
      priority: e.priority,
      updated: e.updated,
    })),
    recentlyShipped: jira.recentlyShipped.map((e) => ({
      key: e.key,
      summary: e.summary,
      assignee: e.assignee,
    })),
    portfolioEpics: jira.portfolioEpics.map((e) => ({
      key: e.key,
      summary: e.summary,
      status: e.status,
      assignee: e.assignee,
      priority: e.priority,
      fixVersions: e.fixVersions,
      updated: e.updated,
    })),
    repoActivity: github.repoActivity.map((r) => ({
      repo: r.repo,
      merged: r.mergedPRs,
      open: r.openPRs,
      activity: r.activity,
    })),
    recentReleases: github.recentReleases.slice(0, 10).map((r) => ({
      repo: r.repo,
      tag: r.tagName,
      date: r.publishedAt,
    })),
    confluencePages: confluence.pageDetails.map((p) => ({
      title: p.title,
      url: p.url,
      lastModified: p.lastModified,
      bodyPreview: p.bodyText,
    })),
    confluenceMeetingNotes: confluence.meetingNotes.map((p) => ({
      title: p.title,
      url: p.url,
      lastModified: p.lastModified,
    })),
  }

  return JSON.stringify(context)
}
