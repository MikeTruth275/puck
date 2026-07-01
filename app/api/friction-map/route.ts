import { NextResponse } from "next/server"
import { getPortfolioEpics, getBlockedItems } from "@/lib/api/jira"
import type { JiraIssue } from "@/lib/api/jira"
import { PM_ROSTER, matchPM, matchAllPMs } from "@/lib/api/pm-mapping"

interface FrictionEdge {
  team1: string
  team2: string
  level: "high" | "moderate" | "weak"
  signals: string[]
  epicKeys: string[]
}

interface SharedEngineer {
  name: string
  teams: string[]
  epicCount: number
}

export async function GET() {
  try {
    const [epics, blocked] = await Promise.all([
      getPortfolioEpics(),
      getBlockedItems(),
    ])

    const blockedKeys = new Set(blocked.map((e) => e.key))

    // 1. Find epics that match multiple PM keywords (cross-team work)
    const crossTeamEpics: Array<{ epic: JiraIssue; teams: string[] }> = []
    for (const epic of epics) {
      const teams = matchAllPMs(epic)
      if (teams.length > 1) {
        crossTeamEpics.push({ epic, teams })
      }
    }

    // 2. Find engineers working across multiple PM domains
    const engineerTeams: Record<string, Set<string>> = {}
    const engineerEpics: Record<string, number> = {}
    for (const epic of epics) {
      if (!epic.assignee) continue
      const pm = matchPM(epic)
      if (!pm) continue
      if (!engineerTeams[epic.assignee]) engineerTeams[epic.assignee] = new Set()
      engineerTeams[epic.assignee].add(pm)
      engineerEpics[epic.assignee] = (engineerEpics[epic.assignee] || 0) + 1
    }

    const sharedEngineers: SharedEngineer[] = Object.entries(engineerTeams)
      .filter(([, teams]) => teams.size > 1)
      .map(([name, teams]) => ({
        name,
        teams: [...teams],
        epicCount: engineerEpics[name] || 0,
      }))
      .sort((a, b) => b.teams.length - a.teams.length)

    // 3. Build friction edges between PM pairs
    const edgeMap = new Map<string, { signals: string[]; epicKeys: string[]; blockedCount: number }>()

    function edgeKey(a: string, b: string): string {
      return [a, b].sort().join("|||")
    }

    function addSignal(pm1: string, pm2: string, signal: string, epicKey: string, isBlocked: boolean) {
      const key = edgeKey(pm1, pm2)
      if (!edgeMap.has(key)) edgeMap.set(key, { signals: [], epicKeys: [], blockedCount: 0 })
      const edge = edgeMap.get(key)!
      edge.signals.push(signal)
      if (!edge.epicKeys.includes(epicKey)) edge.epicKeys.push(epicKey)
      if (isBlocked) edge.blockedCount++
    }

    // Cross-team epics create friction signals
    for (const { epic, teams } of crossTeamEpics) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const isBlocked = blockedKeys.has(epic.key)
          addSignal(
            teams[i], teams[j],
            `${epic.key}: ${epic.summary.slice(0, 60)} (${epic.status}${isBlocked ? " - BLOCKED" : ""})`,
            epic.key,
            isBlocked
          )
        }
      }
    }

    // Shared engineers create coordination load signals
    for (const eng of sharedEngineers) {
      for (let i = 0; i < eng.teams.length; i++) {
        for (let j = i + 1; j < eng.teams.length; j++) {
          addSignal(
            eng.teams[i], eng.teams[j],
            `Shared engineer: ${eng.name} (${eng.epicCount} epics across teams)`,
            "",
            false
          )
        }
      }
    }

    // Convert to edges with level
    const frictionEdges: FrictionEdge[] = [...edgeMap.entries()].map(([key, data]) => {
      const [team1, team2] = key.split("|||")
      let level: FrictionEdge["level"] = "weak"
      if (data.blockedCount > 0 || data.epicKeys.length >= 5) level = "high"
      else if (data.epicKeys.length >= 2 || data.signals.length >= 3) level = "moderate"

      return {
        team1,
        team2,
        level,
        signals: data.signals,
        epicKeys: data.epicKeys.filter(Boolean),
      }
    }).sort((a, b) => {
      const order = { high: 0, moderate: 1, weak: 2 }
      return order[a.level] - order[b.level]
    })

    // 4. Per-team friction summary
    const teamFriction: Record<string, { connections: number; highCount: number; epicCount: number }> = {}
    for (const pm of PM_ROSTER) {
      teamFriction[pm.name] = { connections: 0, highCount: 0, epicCount: 0 }
    }
    for (const edge of frictionEdges) {
      if (teamFriction[edge.team1]) {
        teamFriction[edge.team1].connections++
        teamFriction[edge.team1].epicCount += edge.epicKeys.length
        if (edge.level === "high") teamFriction[edge.team1].highCount++
      }
      if (teamFriction[edge.team2]) {
        teamFriction[edge.team2].connections++
        teamFriction[edge.team2].epicCount += edge.epicKeys.length
        if (edge.level === "high") teamFriction[edge.team2].highCount++
      }
    }

    return NextResponse.json({
      frictionEdges,
      crossTeamEpics: crossTeamEpics.map(({ epic, teams }) => ({
        key: epic.key,
        summary: epic.summary,
        status: epic.status,
        assignee: epic.assignee,
        teams,
        isBlocked: blockedKeys.has(epic.key),
      })),
      sharedEngineers,
      teamFriction,
      summary: {
        totalEdges: frictionEdges.length,
        highFriction: frictionEdges.filter((e) => e.level === "high").length,
        moderateFriction: frictionEdges.filter((e) => e.level === "moderate").length,
        crossTeamEpicCount: crossTeamEpics.length,
        sharedEngineerCount: sharedEngineers.length,
      },
    })
  } catch (err) {
    console.error("Friction map API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Friction map fetch failed" },
      { status: 500 }
    )
  }
}
