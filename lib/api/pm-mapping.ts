import type { JiraIssue } from "./jira"

export interface PMInfo {
  name: string
  initiative: string
  keywords: RegExp
}

export const PM_ROSTER: PMInfo[] = [
  {
    name: "Doris Jwo",
    initiative: "Writer Agent / Playbooks / Skills",
    keywords: /writer agent|playbook|skill|deliverable|presentation|magic link|snippet|team prompt|my work|home screen|sign.?in|onboard|doc management|editor|rewrite|keep writing|claims|projects|model selection/i,
  },
  {
    name: "Patrick Lin",
    initiative: "Voice 2.0 / Enterprise Admin / Billing",
    keywords: /voice|styleguide|style guide|terms|lite seat|billing|credit|admin|role|permission|sso|scim|nlu|nlg|highlight|suggestion|rbac|encryption|byok|tenant encrypt/i,
  },
  {
    name: "Sam Julien",
    initiative: "AIS 2.0 / LLM Gateway / DevX / Plugins",
    keywords: /ai studio|ais |aistudio|llm gateway|gateway|devx|developer|sdk|api|plugin|datadog|observability|dashboard|nvidia|baseten|azure|provider|agent management|app.?agent|application.?agent|kong|cache|rate limit|palmyra/i,
  },
  {
    name: "Ada Li",
    initiative: "AIRR / Enterprise Brain",
    keywords: /airr|enterprise brain|knowledge graph|enterprise knowledge|retrieval|extraction|brain/i,
  },
  {
    name: "Helen Ulasevich",
    initiative: "Strategic Deployment / Extensions",
    keywords: /strategic deploy|chrome ext|figma ext|mac app|windows app|ms office|office plugin|extension|vanguard|goldman|cigna|examwork|upgrade|deployment/i,
  },
  {
    name: "Ashley Brooks",
    initiative: "MCP / Connectors",
    keywords: /mcp|connector|asana|bigquery|snowflake|databricks|salesforce|hubspot|confluence connect|gong|slack connect|sharepoint|google drive|custom connector|byo.?mcp|tool description|agent library|prebuilt agent|webhook/i,
  },
]

export function matchPM(epic: JiraIssue): string | null {
  const directMatch = PM_ROSTER.find((pm) => pm.name === epic.assignee)
  if (directMatch) return directMatch.name

  for (const pm of PM_ROSTER) {
    if (pm.keywords.test(epic.summary)) return pm.name
  }

  if (epic.key.startsWith("AIRR-")) return "Ada Li"
  if (epic.key.startsWith("ACTION-")) return "Doris Jwo"

  return null
}

// Check if an epic matches keywords from multiple PMs (cross-team signal)
export function matchAllPMs(epic: JiraIssue): string[] {
  const matches: string[] = []
  for (const pm of PM_ROSTER) {
    if (pm.keywords.test(epic.summary)) matches.push(pm.name)
  }
  if (epic.key.startsWith("AIRR-") && !matches.includes("Ada Li")) matches.push("Ada Li")
  if (epic.key.startsWith("ACTION-") && !matches.includes("Doris Jwo")) matches.push("Doris Jwo")
  if (epic.assignee) {
    const direct = PM_ROSTER.find((pm) => pm.name === epic.assignee)
    if (direct && !matches.includes(direct.name)) matches.push(direct.name)
  }
  return matches
}
