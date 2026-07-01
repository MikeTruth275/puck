"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FrictionEdge {
  team1: string
  team2: string
  level: "high" | "moderate" | "weak"
  signals: string[]
  epicKeys: string[]
}

interface CrossTeamEpic {
  key: string
  summary: string
  status: string
  assignee: string | null
  teams: string[]
  isBlocked: boolean
}

interface SharedEngineer {
  name: string
  teams: string[]
  epicCount: number
}

interface FrictionData {
  frictionEdges: FrictionEdge[]
  crossTeamEpics: CrossTeamEpic[]
  sharedEngineers: SharedEngineer[]
  teamFriction: Record<string, { connections: number; highCount: number; epicCount: number }>
  summary: {
    totalEdges: number
    highFriction: number
    moderateFriction: number
    crossTeamEpicCount: number
    sharedEngineerCount: number
  }
}

const LEVEL_COLORS = {
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  moderate: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  weak: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
}

const LEVEL_DOT = {
  high: "bg-red-500",
  moderate: "bg-amber-500",
  weak: "bg-emerald-500",
}

export default function FrictionMapPage() {
  const [data, setData] = useState<FrictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedEdge, setExpandedEdge] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/friction-map")
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const toggleEdge = (key: string) => setExpandedEdge(expandedEdge === key ? null : key)

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Friction Map</h1>
          <span className="text-sm text-muted-foreground">Cross-team dependencies and coordination load</span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />Loading...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />Live from Jira
            </div>
          )}
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />{error}
          <Button variant="outline" size="sm" className="ml-2 h-6 text-xs" onClick={fetchData}>Retry</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : data && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-5 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground">Team Pairs</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.totalEdges}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-xs font-medium text-muted-foreground">High Friction</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">{data.summary.highFriction}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-medium text-muted-foreground">Moderate</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.moderateFriction}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-purple-500" />
                        <p className="text-xs font-medium text-muted-foreground">Cross-Team Epics</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.crossTeamEpicCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <p className="text-xs font-medium text-muted-foreground">Shared Engineers</p>
                      </div>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.sharedEngineerCount}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Team friction summary */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Friction Load by Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(data.teamFriction)
                        .sort(([, a], [, b]) => b.highCount - a.highCount || b.connections - a.connections)
                        .map(([name, info]) => (
                          <div key={name} className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                              <p className="text-sm font-medium">{name}</p>
                              <p className="text-[10px] text-muted-foreground">{info.connections} connections, {info.epicCount} shared epics</p>
                            </div>
                            {info.highCount > 0 && (
                              <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 text-[10px]">
                                {info.highCount} high
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Friction edges */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Cross-Team Friction Pairs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.frictionEdges.map((edge) => {
                      const key = `${edge.team1}-${edge.team2}`
                      const isExpanded = expandedEdge === key
                      return (
                        <div key={key} className="rounded-lg border border-border">
                          <div
                            className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                            onClick={() => toggleEdge(key)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("h-2.5 w-2.5 rounded-full", LEVEL_DOT[edge.level])} />
                              <span className="text-sm font-medium">{edge.team1}</span>
                              <span className="text-xs text-muted-foreground">↔</span>
                              <span className="text-sm font-medium">{edge.team2}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px]", LEVEL_COLORS[edge.level])}>
                                {edge.level}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{edge.signals.length} signals</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-border px-3 py-2 space-y-1.5">
                              {edge.signals.map((signal, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                  <span className="text-muted-foreground">{signal}</span>
                                </div>
                              ))}
                              {edge.epicKeys.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {edge.epicKeys.map((key) => (
                                    <a
                                      key={key}
                                      href={`https://writerai.atlassian.net/browse/${key}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono hover:bg-muted/80"
                                    >
                                      {key}
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Shared engineers */}
                {data.sharedEngineers.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Shared Engineers ({data.sharedEngineers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Engineer</TableHead>
                            <TableHead>Teams</TableHead>
                            <TableHead>Epic Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.sharedEngineers.map((eng) => (
                            <TableRow key={eng.name}>
                              <TableCell className="text-sm font-medium">{eng.name}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {eng.teams.map((t) => (
                                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm tabular-nums">{eng.epicCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Cross-team epics */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Cross-Team Epics ({data.crossTeamEpics.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Summary</TableHead>
                          <TableHead>Teams</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.crossTeamEpics.map((epic) => (
                          <TableRow key={epic.key} className="group">
                            <TableCell className="font-mono text-xs font-medium">{epic.key}</TableCell>
                            <TableCell className="max-w-xs truncate text-xs">{epic.summary}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {epic.teams.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-[10px]",
                                epic.isBlocked ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                                  : epic.status === "In Progress" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                                  : ""
                              )}>
                                {epic.isBlocked ? "BLOCKED" : epic.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {epic.assignee || <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}
                            </TableCell>
                            <TableCell>
                              <a
                                href={`https://writerai.atlassian.net/browse/${epic.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
