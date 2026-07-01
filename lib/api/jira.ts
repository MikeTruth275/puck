const JIRA_URL = process.env.JIRA_URL!
const JIRA_EMAIL = process.env.JIRA_EMAIL!
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!

const AUTH = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")

const HEADERS = {
  Authorization: `Basic ${AUTH}`,
  Accept: "application/json",
  "Content-Type": "application/json",
}

const TRACKED_PROJECTS = ["WE", "ACTION", "AIRR"]

// Jira "done" statuses (hygiene is poor, so we check multiple)
const DONE_STATUSES = ["Done", "In Prod", "Shipped/Done", "Ready for Deployment", "Done/In prod"]

export interface JiraIssue {
  key: string
  summary: string
  status: string
  statusCategory: string
  assignee: string | null
  updated: string
  priority: string
  issueType: string
  fixVersions: string[]
  labels: string[]
  description?: string
}

interface JiraSearchResponse {
  issues: Array<{
    key: string
    fields: {
      summary: string
      status: { name: string; statusCategory: { name: string } }
      assignee: { displayName: string } | null
      updated: string
      priority: { name: string }
      issuetype: { name: string }
      fixVersions: Array<{ name: string }>
      labels: string[]
      description?: unknown
    }
  }>
  nextPageToken?: string
  isLast?: boolean
}

const MAX_TOTAL_RESULTS = 500
const MAX_PAGES = 10

// Must use POST /rest/api/3/search/jql -- GET /rest/api/3/search returns 410 Gone
async function searchJira(
  jql: string,
  fields: string[] = ["summary", "status", "assignee", "updated", "priority", "issuetype", "fixVersions", "labels"],
  maxResults = 100
): Promise<JiraIssue[]> {
  const allIssues: JiraIssue[] = []
  let nextPageToken: string | undefined
  let page = 0

  do {
    const body: Record<string, unknown> = { jql, maxResults, fields }
    if (nextPageToken) body.nextPageToken = nextPageToken

    const res = await fetch(`${JIRA_URL}/rest/api/3/search/jql`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Jira search failed (${res.status}): ${text}`)
    }

    const data: JiraSearchResponse = await res.json()

    for (const issue of data.issues) {
      allIssues.push({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        statusCategory: issue.fields.status.statusCategory.name,
        assignee: issue.fields.assignee?.displayName ?? null,
        updated: issue.fields.updated,
        priority: issue.fields.priority.name,
        issueType: issue.fields.issuetype.name,
        fixVersions: issue.fields.fixVersions.map((v) => v.name),
        labels: issue.fields.labels,
      })
    }

    page++
    nextPageToken = data.nextPageToken

    if (data.isLast || !data.issues.length) break
    if (allIssues.length >= MAX_TOTAL_RESULTS || page >= MAX_PAGES) {
      console.warn(`searchJira capped at ${allIssues.length} results / ${page} pages for: ${jql.slice(0, 80)}`)
      break
    }
  } while (nextPageToken)

  return allIssues
}

// All portfolio epics: Q1/Q2 fix version OR active (non-Done, non-Cancelled) OR recently updated
// This replaces the old hardcoded 20-key list with the full working set from the Jira plan
export async function getPortfolioEpics(): Promise<JiraIssue[]> {
  const projects = TRACKED_PROJECTS.join(", ")
  const jql = `project IN (${projects}) AND type = Epic AND (
    fixVersion IN ("Q1 2026", "Q2 2026")
    OR status IN ("In Progress", "BLOCKED", "QA Review", "Ready for Testing on Prod")
    OR updated >= -14d
  ) ORDER BY updated DESC`
  return searchJira(jql)
}

export async function getBlockedItems(): Promise<JiraIssue[]> {
  const jql = `project IN (${TRACKED_PROJECTS.join(", ")}) AND status = BLOCKED ORDER BY updated DESC`
  return searchJira(jql)
}

export async function getRecentlyShipped(days = 14): Promise<JiraIssue[]> {
  const statusList = DONE_STATUSES.map((s) => `"${s}"`).join(", ")
  const jql = `project IN (${TRACKED_PROJECTS.join(", ")}) AND type = Epic AND status IN (${statusList}) AND updated >= -${days}d ORDER BY updated DESC`
  return searchJira(jql)
}

export async function getRecentlyUpdatedEpics(days = 7): Promise<JiraIssue[]> {
  const jql = `project IN (${TRACKED_PROJECTS.join(", ")}) AND type = Epic AND updated >= -${days}d ORDER BY updated DESC`
  return searchJira(jql)
}

export async function getIssueDetails(key: string): Promise<JiraIssue & { description: string }> {
  const res = await fetch(
    `${JIRA_URL}/rest/api/3/issue/${key}?fields=summary,status,assignee,updated,priority,issuetype,fixVersions,labels,description`,
    { headers: HEADERS }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Jira issue fetch failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    key: data.key,
    summary: data.fields.summary,
    status: data.fields.status.name,
    statusCategory: data.fields.status.statusCategory.name,
    assignee: data.fields.assignee?.displayName ?? null,
    updated: data.fields.updated,
    priority: data.fields.priority.name,
    issueType: data.fields.issuetype.name,
    fixVersions: data.fields.fixVersions.map((v: { name: string }) => v.name),
    labels: data.fields.labels,
    description: typeof data.fields.description === "string"
      ? data.fields.description
      : JSON.stringify(data.fields.description),
  }
}

// Items at risk: high/highest priority that are stale (not updated in 7+ days) or unassigned
export async function getAtRiskItems(): Promise<JiraIssue[]> {
  const projects = TRACKED_PROJECTS.join(", ")
  const jql = `project IN (${projects}) AND type = Epic AND status NOT IN ("Done", "Won't Do / Cancelled") AND (
    (priority IN ("Highest", "High") AND updated <= -7d)
    OR (priority IN ("Highest", "High") AND assignee IS EMPTY)
    OR (fixVersion IN ("Q1 2026") AND status = "To Do" AND priority IN ("Highest", "High", "Medium"))
  ) ORDER BY priority ASC, updated ASC`
  return searchJira(jql)
}

export async function getAllPortfolioData() {
  const { cached } = await import("./cache")
  return cached("jira:all", async () => {
    const [portfolioEpics, blockedItems, recentlyShipped, recentlyUpdated] = await Promise.all([
      getPortfolioEpics(),
      getBlockedItems(),
      getRecentlyShipped(),
      getRecentlyUpdatedEpics(),
    ])
    return { portfolioEpics, blockedItems, recentlyShipped, recentlyUpdated }
  })
}
