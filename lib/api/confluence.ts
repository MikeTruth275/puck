const CONFLUENCE_URL = process.env.CONFLUENCE_URL!
const CONFLUENCE_EMAIL = process.env.CONFLUENCE_EMAIL!
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN!

const AUTH = Buffer.from(`${CONFLUENCE_EMAIL}:${CONFLUENCE_API_TOKEN}`).toString("base64")

const HEADERS = {
  Authorization: `Basic ${AUTH}`,
  Accept: "application/json",
}

// Key product-related space keys discovered from the instance
const PRODUCT_SPACE_KEYS = [
  "15492bcfd1c843e8aa1ebbbdddd96d95", // Product
  "ENG",                               // Engineering (charters, tech designs, migrations)
  "CE",                                // Cloud
  "EX",                                // Extensions
]

export interface ConfluencePage {
  id: string
  title: string
  spaceId: string
  status: string
  version: number
  lastModified: string
  excerpt: string
  url: string
}

export interface ConfluencePageDetail extends ConfluencePage {
  bodyText: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?ac:[^>]*>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

// CQL search across Confluence
async function cqlSearch(cql: string, limit = 20): Promise<ConfluencePage[]> {
  const res = await fetch(
    `${CONFLUENCE_URL}/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=${limit}&expand=version`,
    { headers: HEADERS }
  )

  if (!res.ok) {
    console.error(`Confluence CQL search failed: ${res.status} ${res.statusText}`)
    return []
  }

  const data = await res.json()
  return (data.results || []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    title: String(p.title || ""),
    spaceId: String((p as Record<string, unknown>).spaceId || ""),
    status: String(p.status || "current"),
    version: (p.version as Record<string, unknown>)?.number as number || 1,
    lastModified: String((p.version as Record<string, unknown>)?.when || ""),
    excerpt: "",
    url: `${CONFLUENCE_URL}${(p._links as Record<string, string>)?.webui || ""}`,
  }))
}

// Fetch a page's full body as plain text
export async function getPageBody(pageId: string): Promise<string> {
  const res = await fetch(
    `${CONFLUENCE_URL}/api/v2/pages/${pageId}?body-format=storage`,
    { headers: HEADERS }
  )

  if (!res.ok) {
    console.error(`Confluence page ${pageId} fetch failed: ${res.status}`)
    return ""
  }

  const data = await res.json()
  const html = data.body?.storage?.value || ""
  return stripHtml(html)
}

// Get recently modified pages from product-related spaces
export async function getRecentProductPages(days = 14, limit = 15): Promise<ConfluencePage[]> {
  const spaceFilter = PRODUCT_SPACE_KEYS.map((k) => `space.key = "${k}"`).join(" OR ")
  const cql = `type = page AND (${spaceFilter}) AND lastmodified >= now('-${days}d') ORDER BY lastmodified DESC`
  return cqlSearch(cql, limit)
}

// Search for pages matching keywords (PRDs, specs, designs)
export async function searchPages(query: string, limit = 10): Promise<ConfluencePage[]> {
  const cql = `type = page AND text ~ "${query}" ORDER BY lastmodified DESC`
  return cqlSearch(cql, limit)
}

// Get pages related to specific Jira epics/initiatives
export async function searchByJiraKeys(keys: string[], limit = 10): Promise<ConfluencePage[]> {
  if (keys.length === 0) return []
  const keyFilter = keys.map((k) => `text ~ "${k}"`).join(" OR ")
  const cql = `type = page AND (${keyFilter}) ORDER BY lastmodified DESC`
  return cqlSearch(cql, limit)
}

// Get recently modified meeting notes
export async function getRecentMeetingNotes(days = 14, limit = 10): Promise<ConfluencePage[]> {
  const cql = `type = page AND title ~ "meeting notes" AND lastmodified >= now('-${days}d') ORDER BY lastmodified DESC`
  return cqlSearch(cql, limit)
}

// Main aggregation: get all relevant Confluence data for synthesis
export async function getAllConfluenceData() {
  const { cached } = await import("./cache")
  return cached("confluence:all", async () => {
    const [recentPages, meetingNotes] = await Promise.all([
      getRecentProductPages(14, 15),
      getRecentMeetingNotes(14, 10),
    ])

    // Fetch body text for top recent pages (limit to avoid token bloat)
    const topPages = recentPages.slice(0, 8)
    const pageDetails: ConfluencePageDetail[] = await Promise.all(
      topPages.map(async (page) => {
        const bodyText = await getPageBody(page.id)
        return {
          ...page,
          bodyText: bodyText.slice(0, 2000),
        }
      })
    )

    return {
      recentPages,
      meetingNotes,
      pageDetails,
      totalRecentPages: recentPages.length,
      totalMeetingNotes: meetingNotes.length,
    }
  })
}
