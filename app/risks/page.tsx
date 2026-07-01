"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  UserX,
  CalendarX,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JiraIssue } from "@/lib/api/jira"

interface RiskItem extends JiraIssue {
  riskReasons: string[]
}

interface RisksData {
  risks: RiskItem[]
  blocked: JiraIssue[]
  unassignedHighPri: JiraIssue[]
  q1NotStarted: JiraIssue[]
  blockedByAssignee: Record<string, number>
  summary: {
    totalRisks: number
    blockedCount: number
    unassignedHighPriCount: number
    q1NotStartedCount: number
  }
}

type RiskCategory = "all" | "blocked" | "unassigned" | "stale" | "q1-not-started"

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

const PRIORITY_COLORS: Record<string, string> = {
  "Highest": "text-red-600 dark:text-red-400",
  "High": "text-orange-600 dark:text-orange-400",
  "Medium": "text-amber-600 dark:text-amber-400",
  "Low": "text-muted-foreground",
}

export default function RisksPage() {
  const [data, setData] = useState<RisksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<RiskCategory>("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/risks")
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filteredRisks = useMemo(() => {
    if (!data) return []
    let items = data.risks

    if (category === "blocked") items = items.filter((e) => e.riskReasons.includes("Blocked"))
    else if (category === "unassigned") items = items.filter((e) => e.riskReasons.includes("Unassigned"))
    else if (category === "stale") items = items.filter((e) => e.riskReasons.some((r) => r.startsWith("Stale")))
    else if (category === "q1-not-started") items = items.filter((e) => e.riskReasons.includes("Q1 not started"))

    if (priorityFilter !== "all") items = items.filter((e) => e.priority === priorityFilter)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((e) => e.summary.toLowerCase().includes(q) || e.key.toLowerCase().includes(q))
    }

    return items
  }, [data, category, priorityFilter, search])

  // Top blocked assignees for the heatmap
  const topBlocked = useMemo(() => {
    if (!data) return []
    return Object.entries(data.blockedByAssignee)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [data])

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Risks</h1>
          {data && (
            <span className="text-sm text-muted-foreground">
              {filteredRisks.length} of {data.summary.totalRisks} risk items
            </span>
          )}
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
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Summary cards */}
            {data && (
              <div className="grid grid-cols-4 gap-4">
                <Card
                  className={cn("cursor-pointer transition-all hover:border-foreground/20", category === "blocked" && "ring-1 ring-foreground/20")}
                  onClick={() => setCategory(category === "blocked" ? "all" : "blocked")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      <p className="text-xs font-medium text-muted-foreground">Blocked</p>
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.blockedCount}</p>
                  </CardContent>
                </Card>
                <Card
                  className={cn("cursor-pointer transition-all hover:border-foreground/20", category === "unassigned" && "ring-1 ring-foreground/20")}
                  onClick={() => setCategory(category === "unassigned" ? "all" : "unassigned")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-amber-500" />
                      <p className="text-xs font-medium text-muted-foreground">Unassigned (High+)</p>
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.unassignedHighPriCount}</p>
                  </CardContent>
                </Card>
                <Card
                  className={cn("cursor-pointer transition-all hover:border-foreground/20", category === "stale" && "ring-1 ring-foreground/20")}
                  onClick={() => setCategory(category === "stale" ? "all" : "stale")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <p className="text-xs font-medium text-muted-foreground">Stale (7d+)</p>
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {data.risks.filter((r) => r.riskReasons.some((rr) => rr.startsWith("Stale"))).length}
                    </p>
                  </CardContent>
                </Card>
                <Card
                  className={cn("cursor-pointer transition-all hover:border-foreground/20", category === "q1-not-started" && "ring-1 ring-foreground/20")}
                  onClick={() => setCategory(category === "q1-not-started" ? "all" : "q1-not-started")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CalendarX className="h-4 w-4 text-purple-500" />
                      <p className="text-xs font-medium text-muted-foreground">Q1 Not Started</p>
                    </div>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{data.summary.q1NotStartedCount}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Blocked heatmap */}
            {data && topBlocked.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Blocked Items by Assignee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topBlocked.map(([name, count]) => (
                      <div
                        key={name}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2",
                          count >= 10
                            ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                            : count >= 5
                            ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                            : "border-border"
                        )}
                      >
                        <span className="text-xs font-medium">{name}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px]",
                            count >= 10 ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : ""
                          )}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search risk items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Highest">Highest</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                </SelectContent>
              </Select>
              {(category !== "all" || priorityFilter !== "all" || search) && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
                  setCategory("all"); setPriorityFilter("all"); setSearch("")
                }}>Clear filters</Button>
              )}
            </div>

            {/* Risk table */}
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Risk Reasons</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRisks.map((item) => (
                        <TableRow key={item.key} className="group">
                          <TableCell className="font-mono text-xs font-medium">{item.key}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">{item.summary}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.riskReasons.map((reason) => (
                                <Badge
                                  key={reason}
                                  variant="outline"
                                  className={cn(
                                    "text-[10px]",
                                    reason === "Blocked"
                                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                                      : reason === "Unassigned"
                                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                                      : reason.startsWith("Stale")
                                      ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400"
                                      : "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400"
                                  )}
                                >
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.assignee || <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}
                          </TableCell>
                          <TableCell className={cn("text-xs font-medium", PRIORITY_COLORS[item.priority] || "")}>
                            {item.priority}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px]",
                              item.status === "BLOCKED" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" : ""
                            )}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div
                              className={cn(
                                "flex items-center gap-1 text-xs",
                                daysSince(item.updated) >= 14
                                  ? "text-red-600 dark:text-red-400"
                                  : daysSince(item.updated) >= 7
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Clock className="h-3 w-3" />
                              {formatRelative(item.updated)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://writerai.atlassian.net/browse/${item.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredRisks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                            No risk items match current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
