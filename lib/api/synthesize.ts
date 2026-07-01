import { chatCompletion } from "./writer"
import type { JiraIssue } from "./jira"
import type { GitHubPR, RepoActivity, GitHubRelease } from "./github"
import type { ConfluencePage, ConfluencePageDetail } from "./confluence"
import type {
  Change, Risk, Friction, PMSignal, ContextSignal,
  Recommendation, OneOnOneBrief, SummaryMetric,
} from "./types"

const PM_OWNERSHIP: Record<string, { name: string; initiative: string }> = {
  "Doris Jwo": { name: "Doris Jwo", initiative: "Writer Agent / Playbooks / Skills" },
  "Patrick Lin": { name: "Patrick Lin", initiative: "Voice 2.0 / Enterprise Admin / Billing" },
  "Sam Julien": { name: "Sam Julien", initiative: "AIS 2.0 / LLM Gateway / DevX / Plugins" },
  "Ada Li": { name: "Ada Li", initiative: "AIRR / Enterprise Brain" },
  "Helen Ulasevich": { name: "Helen Ulasevich", initiative: "Strategic Deployment / Extensions" },
  "Ashley Brooks": { name: "Ashley Brooks", initiative: "MCP / Connectors" },
}

interface RawPortfolioData {
  jira: {
    portfolioEpics: JiraIssue[]
    blockedItems: JiraIssue[]
    recentlyShipped: JiraIssue[]
    recentlyUpdated: JiraIssue[]
  }
  github: {
    mergedPRs: GitHubPR[]
    repoActivity: RepoActivity[]
    recentReleases: GitHubRelease[]
  }
  confluence?: {
    recentPages: ConfluencePage[]
    meetingNotes: ConfluencePage[]
    pageDetails: ConfluencePageDetail[]
  }
}

interface SynthesizedBrief {
  summaryMetrics: SummaryMetric[]
  changes: Change[]
  risks: Risk[]
  frictions: Friction[]
  pmSignals: PMSignal[]
  contextSignals: ContextSignal[]
  recommendations: Recommendation[]
  oneOnOneBrief: OneOnOneBrief
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function buildPrompt(data: RawPortfolioData): string {
  const epics = data.jira.portfolioEpics

  const highSignal = epics.filter((e) =>
    e.status === "BLOCKED" ||
    e.status === "QA Review" ||
    e.status === "Ready for Testing on Prod" ||
    (e.status === "In Progress" && new Date(e.updated) > new Date(Date.now() - 14 * 86400000)) ||
    e.fixVersions.some((v) => v.includes("2026"))
  )

  const highSignalKeys = new Set(highSignal.map((e) => e.key))
  const remaining = epics.filter((e) => !highSignalKeys.has(e.key))

  const tier1Summary = highSignal.map((e) =>
    `- ${e.key}: ${e.summary} | ${e.status} | ${e.assignee || "Unassigned"} | P: ${e.priority} | Fix: ${e.fixVersions.join(", ") || "None"} | ${formatDate(e.updated)}`
  ).join("\n")

  const remainingByStatus: Record<string, number> = {}
  for (const e of remaining) {
    remainingByStatus[e.status] = (remainingByStatus[e.status] || 0) + 1
  }

  const tier2Summary = `${remaining.length} additional epics: ` +
    Object.entries(remainingByStatus).map(([s, c]) => `${c} ${s}`).join(", ")

  const blockedSummary = data.jira.blockedItems.slice(0, 30).map((e) =>
    `- ${e.key}: ${e.summary} | ${e.assignee || "Unassigned"} | ${formatDate(e.updated)}`
  ).join("\n") || "None"
  const blockedOverflow = data.jira.blockedItems.length > 30
    ? `\n(+ ${data.jira.blockedItems.length - 30} more blocked items)`
    : ""

  const shippedSummary = data.jira.recentlyShipped.map((e) =>
    `- ${e.key}: ${e.summary} | ${e.assignee || "Unassigned"}`
  ).join("\n") || "None"

  const repoSummary = data.github.repoActivity.map((r) =>
    `- ${r.repo}: ${r.mergedPRs} merged, ${r.openPRs} open (${r.activity})`
  ).join("\n")

  const releaseSummary = data.github.recentReleases.slice(0, 8).map((r) =>
    `- ${r.repo} ${r.tagName} (${formatDate(r.publishedAt)})`
  ).join("\n") || "None recent"

  const topPRs = data.github.mergedPRs.slice(0, 20).map((pr) =>
    `- [${pr.repo}] ${pr.title} (${pr.jiraKeys.join(", ") || "no Jira key"})`
  ).join("\n")

  const pmList = Object.values(PM_OWNERSHIP).map((p) =>
    `- ${p.name}: ${p.initiative}`
  ).join("\n")

  const confluenceSection = data.confluence?.pageDetails?.length
    ? `\n## Confluence (recently updated product docs)\n${data.confluence.pageDetails.map((p) =>
        `- "${p.title}" (modified ${p.lastModified ? formatDate(p.lastModified) : "recently"})\n  ${p.bodyText.slice(0, 500)}`
      ).join("\n")}\n\n### Recent Meeting Notes\n${(data.confluence.meetingNotes || []).map((p) =>
        `- "${p.title}" (${p.lastModified ? formatDate(p.lastModified) : "recently"})`
      ).join("\n") || "None found"}`
    : ""

  return `You are a portfolio intelligence analyst for Mike Taylor, Product Operations Lead at Writer (Series C AI company). Analyze this Jira + GitHub + Confluence data and produce a structured weekly brief for his Tuesday 1:1 with Waseem (VP Product).

## PM Ownership
${pmList}

## Portfolio Epics: ${epics.length} total (WE/ACTION/AIRR)

### High-Signal Epics (${highSignal.length}) -- BLOCKED, active In Progress, or Q1/Q2 fix version
${tier1Summary}

### Remaining Portfolio
${tier2Summary}

## Blocked Items (${data.jira.blockedItems.length} total)
${blockedSummary}${blockedOverflow}

## Recently Shipped (last 14 days, ${data.jira.recentlyShipped.length} epics)
${shippedSummary}

## GitHub (last 7 days)
${data.github.mergedPRs.length} PRs merged org-wide

### Repo Activity
${repoSummary}

### Releases
${releaseSummary}

### Notable PRs
${topPRs}
${confluenceSection}

---

IMPORTANT: Keep your response concise. Limit changes to the 5-8 most material. Limit risks to 4-6 most impactful. Limit recommendations to 5.

Produce a JSON object with this exact structure:

{
  "summaryMetrics": [
    { "label": "Material Changes", "value": <number>, "delta": "<+N/-N/0>", "trend": "up|down|neutral" },
    { "label": "Active Risks", "value": <number>, "delta": "<string>", "trend": "up|down|neutral" },
    { "label": "Cross-Team Frictions", "value": <number>, "delta": "<string>", "trend": "up|down|neutral" },
    { "label": "PM Signals to Review", "value": <number>, "delta": "<string>", "trend": "up|down|neutral" },
    { "label": "Items for Waseem", "value": <number>, "delta": "<string>", "trend": "up|down|neutral" }
  ],
  "changes": [{ "id": "ch1", "initiative": "", "pm": "", "changeType": "Timeline|Scope Cut|Scope Expansion|Sequencing|Owner Change|Risk Escalation|Status Change", "before": "", "after": "", "whyItMatters": "", "confidence": "High|Medium|Low", "category": "schedule|scope|dependency|ownership|risk" }],
  "risks": [{ "id": "r1", "title": "", "category": "Dependency|Resource|Strategic|Financial", "evidence": "", "interpretation": "", "impact": "High|Medium|Low", "confidence": "High|Medium|Low", "recommendation": "", "owner": "", "initiative": "" }],
  "frictions": [{ "team1": "", "team2": "", "level": "high|moderate|weak", "issue": "" }],
  "pmSignals": [{ "pm": "", "initiative": "", "scores": { "commitmentIntegrity": 0, "varianceFromPlan": 0, "communicationQuality": 0, "dependencyHealth": 0, "executionControl": 0, "strategicAltitude": 0 }, "interpretation": "" }],
  "contextSignals": [{ "type": "", "description": "", "impact": "High|Medium|Low", "opportunity": "" }],
  "recommendations": [{ "id": 1, "text": "" }],
  "oneOnOneBrief": { "bluf": "", "topSignals": [], "biggestRisks": [], "recommendations": [], "calibrationTopics": [] }
}

Return ONLY valid JSON. No markdown fencing. No explanation.`
}

export async function synthesizeBrief(data: RawPortfolioData): Promise<SynthesizedBrief> {
  const prompt = buildPrompt(data)

  const text = await chatCompletion(
    [{ role: "user", content: prompt }],
    { model: "palmyra-x5", maxTokens: 8192, temperature: 0.4 }
  )

  const cleaned = text.replace(/^```json\s*\n?/, "").replace(/\n?```\s*$/, "").trim()

  try {
    return JSON.parse(cleaned) as SynthesizedBrief
  } catch (err) {
    console.error("Failed to parse synthesis response:", cleaned.slice(0, 500))
    throw new Error(`Synthesis JSON parse failed: ${err}`)
  }
}
