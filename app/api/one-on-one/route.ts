import { NextResponse } from "next/server"
import { chatCompletion } from "@/lib/api/writer"
import { getAllPortfolioData } from "@/lib/api/jira"
import { getAllGitHubData } from "@/lib/api/github"
import { getAllConfluenceData } from "@/lib/api/confluence"

export async function GET() {
  try {
    const [jira, github, confluence] = await Promise.all([
      getAllPortfolioData(),
      getAllGitHubData(),
      getAllConfluenceData(),
    ])

    const blockedHighPri = jira.blockedItems.filter((e) =>
      ["Highest", "High"].includes(e.priority)
    ).slice(0, 15)

    const recentShipped = jira.recentlyShipped.slice(0, 10)

    const activeEpics = jira.portfolioEpics.filter((e) =>
      ["In Progress", "BLOCKED", "QA Review"].includes(e.status)
    )

    const q1Epics = jira.portfolioEpics.filter((e) =>
      e.fixVersions.includes("Q1 2026")
    )
    const q1Done = q1Epics.filter((e) => e.statusCategory === "Done")

    const dataContext = `## Portfolio Snapshot
- ${jira.portfolioEpics.length} total epics tracked
- ${activeEpics.length} active (In Progress/Blocked/QA)
- ${jira.blockedItems.length} blocked items (${blockedHighPri.length} High/Highest priority)
- ${recentShipped.length} shipped in last 14 days
- Q1 2026: ${q1Done.length}/${q1Epics.length} done

## Blocked High-Priority Items
${blockedHighPri.map((e) => `- ${e.key}: ${e.summary} | ${e.assignee || "Unassigned"} | Updated: ${new Date(e.updated).toLocaleDateString()}`).join("\n")}

## Recently Shipped
${recentShipped.map((e) => `- ${e.key}: ${e.summary}`).join("\n")}

## GitHub (7 days)
- ${github.mergedPRs.length} PRs merged org-wide
${github.repoActivity.map((r) => `- ${r.repo}: ${r.mergedPRs} merged, ${r.openPRs} open (${r.activity})`).join("\n")}

## Recent Releases
${github.recentReleases.slice(0, 5).map((r) => `- ${r.repo} ${r.tagName} (${new Date(r.publishedAt).toLocaleDateString()})`).join("\n")}

## Key In-Progress Epics (sample)
${activeEpics.slice(0, 20).map((e) => `- ${e.key}: ${e.summary} | ${e.status} | ${e.assignee || "Unassigned"}`).join("\n")}

## Confluence (recently updated product docs)
${confluence.pageDetails.slice(0, 6).map((p) => `- "${p.title}" (modified ${p.lastModified ? new Date(p.lastModified).toLocaleDateString() : "recently"})\n  ${p.bodyText.slice(0, 300)}`).join("\n")}

### Recent Meeting Notes
${confluence.meetingNotes.slice(0, 5).map((p) => `- "${p.title}" (${p.lastModified ? new Date(p.lastModified).toLocaleDateString() : "recently"})`).join("\n") || "None found"}`

    const prompt = `You are helping Mike Taylor (Product Operations Lead at Writer) prepare for his Tuesday 1:1 with Waseem (VP Product). Generate a structured 1:1 brief from this portfolio data (Jira + GitHub + Confluence).

${dataContext}

---

Produce a JSON object with this exact structure. Be direct, sharp, and evidence-based. BLUF first. No filler. Separate facts from interpretation.

{
  "bluf": "<2-3 sentence bottom line for Waseem>",
  "topSignals": [
    { "signal": "<what happened>", "whyICare": "<why it matters>", "whatItSuggests": "<implication>" }
  ],
  "risks": [
    { "title": "<risk>", "evidence": "<specific evidence>", "whyItMatters": "<impact>", "myRead": "<Mike's interpretation>" }
  ],
  "pmSignals": [
    { "pm": "<name>", "signal": "<one line assessment>" }
  ],
  "recommendations": [
    { "text": "<specific actionable recommendation>", "urgency": "now|this-week|next-week" }
  ],
  "calibrationQuestions": [
    "<question for Waseem that requires his judgment or decision>"
  ],
  "cheatSheet": {
    "whatChanged": ["<bullet>", "<bullet>", "<bullet>"],
    "whatIsAtRisk": ["<bullet>", "<bullet>", "<bullet>"],
    "pmQuality": ["<bullet>", "<bullet>", "<bullet>"],
    "whatIRecommend": ["<bullet>", "<bullet>", "<bullet>"],
    "whatINeedFromWaseem": ["<bullet>", "<bullet>"]
  }
}

Keep topSignals to 3-4, risks to 3-4, pmSignals to 6 (one per PM), recommendations to 4-5, calibrationQuestions to 3-4. Return ONLY valid JSON.`

    const text = await chatCompletion(
      [{ role: "user", content: prompt }],
      { model: "palmyra-x5", maxTokens: 8192, temperature: 0.4 }
    )

    const cleaned = text.replace(/^```json\s*\n?/, "").replace(/\n?```\s*$/, "").trim()
    const brief = JSON.parse(cleaned)

    return NextResponse.json({
      brief,
      meta: {
        generatedAt: new Date().toISOString(),
        portfolioSize: jira.portfolioEpics.length,
        blockedCount: jira.blockedItems.length,
        shippedCount: recentShipped.length,
        prsMerged: github.mergedPRs.length,
        q1Progress: { done: q1Done.length, total: q1Epics.length },
      },
    })
  } catch (err) {
    console.error("1:1 Builder API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Brief generation failed" },
      { status: 500 }
    )
  }
}
