"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldAlert,
  Package,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JiraIssue } from "@/lib/api/jira"

interface PMBreakdown {
  totalEpics: number
  inProgress: number
  toDo: number
  blocked: number
  shipped: number
  stale: number
  q1Total: number
  q1Done: number
  q1Blocked: number
  linkedPRs: number
}

interface PMSignalData {
  pm: string
  initiative: string
  scores: {
    commitmentIntegrity: number
    varianceFromPlan: number
    communicationQuality: number
    dependencyHealth: number
    executionControl: number
    strategicAltitude: number
  }
  breakdown: PMBreakdown
  epics: JiraIssue[]
  blockedEpics: JiraIssue[]
  staleEpics: JiraIssue[]
  shippedEpics: JiraIssue[]
}

const SCORE_LABELS: Record<string, { label: string; description: string }> = {
  commitmentIntegrity: { label: "Commitment", description: "Work clearly defined with progress" },
  varianceFromPlan: { label: "Plan Variance", description: "Q1 completion rate" },
  communicationQuality: { label: "Communication", description: "PR-to-Jira linkage" },
  dependencyHealth: { label: "Dependencies", description: "Blocked item ratio" },
  executionControl: { label: "Execution", description: "Staleness and control" },
  strategicAltitude: { label: "Strategy", description: "Q1 scope and delivery" },
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

function avgScore(scores: PMSignalData["scores"]): number {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function PMSignalsPage() {
  const [data, setData] = useState<PMSignalData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPM, setExpandedPM] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/pm-signals")
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const d = await res.json()
      setData(d.pmSignals)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const togglePM = (pm: string) => {
    setExpandedPM(expandedPM === pm ? null : pm)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">PM Signals</h1>
          <span className="text-sm text-muted-foreground">Operating quality by PM, computed from Jira + GitHub</span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />Loading...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />Live from Jira + GitHub
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
          <div className="mx-auto max-w-5xl space-y-4">
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              data?.sort((a, b) => avgScore(a.scores) - avgScore(b.scores)).map((pm) => {
                const avg = avgScore(pm.scores)
                const isExpanded = expandedPM === pm.pm

                return (
                  <Card key={pm.pm} className="border-border bg-card">
                    {/* PM Summary Row */}
                    <div
                      className="flex cursor-pointer items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                      onClick={() => togglePM(pm.pm)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-sm font-medium">
                          {pm.pm.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{pm.pm}</span>
                          <span className="text-xs text-muted-foreground">{pm.initiative}</span>
                        </div>

                        {/* Score bars */}
                        <div className="mt-2 grid grid-cols-6 gap-3">
                          {Object.entries(pm.scores).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{SCORE_LABELS[key]?.label}</span>
                                <span className={cn("text-[10px] font-semibold tabular-nums", scoreColor(value))}>{value}</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div className={cn("h-full rounded-full transition-all", scoreBg(value))} style={{ width: `${value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Avg score + stats */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="grid grid-cols-4 gap-3 text-center">
                          <div>
                            <p className="text-lg font-semibold tabular-nums">{pm.breakdown.totalEpics}</p>
                            <p className="text-[10px] text-muted-foreground">Epics</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{pm.breakdown.shipped}</p>
                            <p className="text-[10px] text-muted-foreground">Shipped</p>
                          </div>
                          <div>
                            <p className={cn("text-lg font-semibold tabular-nums", pm.breakdown.blocked > 0 ? "text-red-600 dark:text-red-400" : "")}>{pm.breakdown.blocked}</p>
                            <p className="text-[10px] text-muted-foreground">Blocked</p>
                          </div>
                          <div>
                            <p className={cn("text-lg font-semibold tabular-nums", pm.breakdown.stale > 0 ? "text-amber-600 dark:text-amber-400" : "")}>{pm.breakdown.stale}</p>
                            <p className="text-[10px] text-muted-foreground">Stale</p>
                          </div>
                        </div>

                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full border-2",
                          avg >= 80 ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : avg >= 60 ? "border-amber-500 text-amber-600 dark:text-amber-400"
                            : "border-red-500 text-red-600 dark:text-red-400"
                        )}>
                          <span className="text-sm font-bold tabular-nums">{avg}</span>
                        </div>

                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        <div className="p-4 space-y-4">
                          {/* Score details */}
                          <div className="grid grid-cols-3 gap-4">
                            {Object.entries(pm.scores).map(([key, value]) => (
                              <div key={key} className="rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">{SCORE_LABELS[key]?.label}</span>
                                  <span className={cn("text-sm font-bold tabular-nums", scoreColor(value))}>{value}</span>
                                </div>
                                <Progress value={value} className="h-2" />
                                <p className="mt-1.5 text-[10px] text-muted-foreground">{SCORE_LABELS[key]?.description}</p>
                              </div>
                            ))}
                          </div>

                          {/* Q1 Progress */}
                          {pm.breakdown.q1Total > 0 && (
                            <Card className="border-border">
                              <CardHeader className="pb-2 pt-3 px-3">
                                <CardTitle className="text-xs font-medium">Q1 2026 Progress</CardTitle>
                              </CardHeader>
                              <CardContent className="px-3 pb-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <Progress value={(pm.breakdown.q1Done / pm.breakdown.q1Total) * 100} className="h-2" />
                                  </div>
                                  <span className="text-xs font-medium tabular-nums">
                                    {pm.breakdown.q1Done}/{pm.breakdown.q1Total} done
                                  </span>
                                  {pm.breakdown.q1Blocked > 0 && (
                                    <Badge variant="outline" className="text-[10px] border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                                      {pm.breakdown.q1Blocked} blocked
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Blocked epics */}
                          {pm.blockedEpics.length > 0 && (
                            <div>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                <ShieldAlert className="h-3.5 w-3.5" />Blocked ({pm.blockedEpics.length})
                              </h4>
                              <div className="space-y-1">
                                {pm.blockedEpics.map((e) => (
                                  <div key={e.key} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 dark:border-red-800 dark:bg-red-950/30">
                                    <div className="flex items-center gap-2">
                                      <code className="text-[10px] font-medium">{e.key}</code>
                                      <span className="text-xs">{e.summary}</span>
                                    </div>
                                    <a href={`https://writerai.atlassian.net/browse/${e.key}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Stale epics */}
                          {pm.staleEpics.length > 0 && (
                            <div>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <Clock className="h-3.5 w-3.5" />Stale 14d+ ({pm.staleEpics.length})
                              </h4>
                              <div className="space-y-1">
                                {pm.staleEpics.slice(0, 8).map((e) => (
                                  <div key={e.key} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                                    <div className="flex items-center gap-2">
                                      <code className="text-[10px] font-medium">{e.key}</code>
                                      <span className="text-xs truncate max-w-md">{e.summary}</span>
                                      <span className="text-[10px] text-muted-foreground">{formatRelative(e.updated)}</span>
                                    </div>
                                    <a href={`https://writerai.atlassian.net/browse/${e.key}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recently shipped */}
                          {pm.shippedEpics.length > 0 && (
                            <div>
                              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Package className="h-3.5 w-3.5" />Shipped Recently ({pm.shippedEpics.length})
                              </h4>
                              <div className="space-y-1">
                                {pm.shippedEpics.map((e) => (
                                  <div key={e.key} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                                    <div className="flex items-center gap-2">
                                      <code className="text-[10px] font-medium">{e.key}</code>
                                      <span className="text-xs">{e.summary}</span>
                                    </div>
                                    <a href={`https://writerai.atlassian.net/browse/${e.key}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* All epics table */}
                          <div>
                            <h4 className="mb-2 text-xs font-medium">All Epics ({pm.epics.length})</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Key</TableHead>
                                  <TableHead>Summary</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Priority</TableHead>
                                  <TableHead>Updated</TableHead>
                                  <TableHead className="w-8" />
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {pm.epics.slice(0, 20).map((e) => (
                                  <TableRow key={e.key} className="group">
                                    <TableCell className="font-mono text-[10px] font-medium">{e.key}</TableCell>
                                    <TableCell className="max-w-xs truncate text-xs">{e.summary}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={cn("text-[10px]",
                                        e.status === "BLOCKED" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                                          : e.status === "In Progress" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                                          : e.status === "Done" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                          : ""
                                      )}>
                                        {e.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-[10px]">{e.priority}</TableCell>
                                    <TableCell className="text-[10px] text-muted-foreground">{formatRelative(e.updated)}</TableCell>
                                    <TableCell>
                                      <a href={`https://writerai.atlassian.net/browse/${e.key}`} target="_blank" rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                      </a>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {pm.epics.length > 20 && (
                              <p className="px-4 py-2 text-[10px] text-muted-foreground">+ {pm.epics.length - 20} more epics</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
