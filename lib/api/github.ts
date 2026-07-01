const GITHUB_TOKEN = process.env.GITHUB_TOKEN!

const HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "puck-app",
}

const ORG = "WriterColab"

// Key repos from the roadmap
const KEY_REPOS = [
  "fs.action-ai",
  "fe.core",
  "fs.enterprise-knowledge",
  "qa.auto.api",
]

export interface GitHubPR {
  number: number
  title: string
  state: string
  mergedAt: string | null
  createdAt: string
  updatedAt: string
  user: string
  repo: string
  url: string
  jiraKeys: string[]
}

export interface RepoActivity {
  repo: string
  totalPRs: number
  mergedPRs: number
  openPRs: number
  lastCommit: string | null
  activity: "Very High" | "High" | "Moderate" | "Low"
}

export interface GitHubRelease {
  repo: string
  tagName: string
  name: string
  publishedAt: string
  body: string
  url: string
}

async function githubFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: HEADERS })
  if (res.status === 403) {
    const body = await res.text()
    if (body.includes("SAML")) {
      throw new Error(
        "GitHub SAML/SSO error: PAT needs re-authorization. Go to GitHub Settings > Developer settings > Personal access tokens > Configure SSO for WriterColab."
      )
    }
    throw new Error(`GitHub 403: ${body}`)
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub request failed (${res.status}): ${text}`)
  }
  return res
}

// Extract Jira keys from PR titles (e.g., "WE-1234", "ACTION-567")
function extractJiraKeys(text: string): string[] {
  const matches = text.match(/(?:WE|ACTION|AIRR)-\d+/g)
  return matches ? [...new Set(matches)] : []
}

function classifyActivity(mergedCount: number): RepoActivity["activity"] {
  if (mergedCount >= 20) return "Very High"
  if (mergedCount >= 10) return "High"
  if (mergedCount >= 3) return "Moderate"
  return "Low"
}

export async function getMergedPRs(days = 7): Promise<GitHubPR[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const query = encodeURIComponent(`org:${ORG} is:pr is:merged merged:>=${since}`)
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=${query}&per_page=100&sort=updated&order=desc`
  )
  const data = await res.json()

  return (data.items || []).map((item: Record<string, unknown>) => {
    const repoUrl = (item.repository_url as string) || ""
    const repo = repoUrl.split("/").pop() || ""
    return {
      number: item.number as number,
      title: item.title as string,
      state: "merged",
      mergedAt: (item.pull_request as Record<string, unknown>)?.merged_at as string | null,
      createdAt: item.created_at as string,
      updatedAt: item.updated_at as string,
      user: (item.user as Record<string, unknown>)?.login as string,
      repo,
      url: item.html_url as string,
      jiraKeys: extractJiraKeys(item.title as string),
    }
  })
}

export async function getRepoActivity(days = 7): Promise<RepoActivity[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const results: RepoActivity[] = []

  for (const repo of KEY_REPOS) {
    try {
      // Get merged PRs count
      const mergedQuery = encodeURIComponent(
        `repo:${ORG}/${repo} is:pr is:merged merged:>=${since}`
      )
      const mergedRes = await githubFetch(
        `https://api.github.com/search/issues?q=${mergedQuery}&per_page=1`
      )
      const mergedData = await mergedRes.json()
      const mergedCount = mergedData.total_count || 0

      // Get open PRs count
      const openQuery = encodeURIComponent(
        `repo:${ORG}/${repo} is:pr is:open`
      )
      const openRes = await githubFetch(
        `https://api.github.com/search/issues?q=${openQuery}&per_page=1`
      )
      const openData = await openRes.json()
      const openCount = openData.total_count || 0

      // Get latest commit
      let lastCommit: string | null = null
      try {
        const commitsRes = await githubFetch(
          `https://api.github.com/repos/${ORG}/${repo}/commits?per_page=1`
        )
        const commits = await commitsRes.json()
        if (commits.length > 0) {
          lastCommit = commits[0].commit.committer.date
        }
      } catch {
        // Some repos may not be accessible
      }

      results.push({
        repo,
        totalPRs: mergedCount + openCount,
        mergedPRs: mergedCount,
        openPRs: openCount,
        lastCommit,
        activity: classifyActivity(mergedCount),
      })
    } catch (err) {
      console.error(`Failed to get activity for ${repo}:`, err)
      results.push({
        repo,
        totalPRs: 0,
        mergedPRs: 0,
        openPRs: 0,
        lastCommit: null,
        activity: "Low",
      })
    }
  }

  return results
}

export async function getRecentReleases(): Promise<GitHubRelease[]> {
  const releases: GitHubRelease[] = []

  for (const repo of KEY_REPOS) {
    try {
      const res = await githubFetch(
        `https://api.github.com/repos/${ORG}/${repo}/releases?per_page=5`
      )
      const data = await res.json()

      for (const release of data) {
        releases.push({
          repo,
          tagName: release.tag_name,
          name: release.name || release.tag_name,
          publishedAt: release.published_at,
          body: release.body || "",
          url: release.html_url,
        })
      }
    } catch {
      // Some repos may not have releases
    }
  }

  return releases.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export async function searchPRsByKeyword(keyword: string, days = 7): Promise<GitHubPR[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const query = encodeURIComponent(
    `org:${ORG} is:pr is:merged merged:>=${since} ${keyword}`
  )
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=${query}&per_page=30&sort=updated&order=desc`
  )
  const data = await res.json()

  return (data.items || []).map((item: Record<string, unknown>) => {
    const repoUrl = (item.repository_url as string) || ""
    const repo = repoUrl.split("/").pop() || ""
    return {
      number: item.number as number,
      title: item.title as string,
      state: "merged",
      mergedAt: (item.pull_request as Record<string, unknown>)?.merged_at as string | null,
      createdAt: item.created_at as string,
      updatedAt: item.updated_at as string,
      user: (item.user as Record<string, unknown>)?.login as string,
      repo,
      url: item.html_url as string,
      jiraKeys: extractJiraKeys(item.title as string),
    }
  })
}

export async function getAllGitHubData() {
  const { cached } = await import("./cache")
  return cached("github:all", async () => {
    const [mergedPRs, repoActivity, recentReleases] = await Promise.all([
      getMergedPRs(),
      getRepoActivity(),
      getRecentReleases(),
    ])
    return { mergedPRs, repoActivity, recentReleases }
  })
}
