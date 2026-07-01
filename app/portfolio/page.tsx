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
  ArrowUpDown,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JiraIssue } from "@/lib/api/jira"

type SortField = "key" | "summary" | "status" | "assignee" | "priority" | "updated"
type SortDir = "asc" | "desc"
type GroupBy = "none" | "status" | "assignee" | "project" | "priority"

interface PortfolioData {
  epics: JiraIssue[]
  statusCounts: Record<string, number>
  priorityCounts: Record<string, number>
  projectCounts: Record<string, number>
  totalCount: number
}

const STATUS_ORDER: Record<string, number> = {
  "BLOCKED": 0,
  "QA Review": 1,
  "Ready for Testing on Prod": 2,
  "In Progress": 3,
  "To Do": 4,
  "Done": 5,
  "Won't Do / Cancelled": 6,
}

const STATUS_COLORS: Record<string, string> = {
  "BLOCKED": "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
  "QA Review": "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
  "Ready for Testing on Prod": "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
  "To Do": "border-muted text-muted-foreground",
  "Done": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  "Won't Do / Cancelled": "border-muted text-muted-foreground line-through",
}

const PRIORITY_COLORS: Record<string, string> = {
  "Highest": "text-red-600 dark:text-red-400",
  "High": "text-orange-600 dark:text-orange-400",
  "Medium": "text-amber-600 dark:text-amber-400",
  "Low": "text-muted-foreground",
  "Lowest": "text-muted-foreground",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [groupBy, setGroupBy] = useState<GroupBy>("status")

  // Sort
  const [sortField, setSortField] = useState<SortField>("updated")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/portfolio")
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const d = await res.json()
      setData(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Derived data
  const assignees = useMemo(() => {
    if (!data) return []
    const set = new Set(data.epics.map((e) => e.assignee || "Unassigned"))
    return [...set].sort()
  }, [data])

  const filteredEpics = useMemo(() => {
    if (!data) return []
    return data.epics.filter((e) => {
      if (search && !e.summary.toLowerCase().includes(search.toLowerCase()) && !e.key.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== "all" && e.status !== statusFilter) return false
      if (assigneeFilter !== "all" && (e.assignee || "Unassigned") !== assigneeFilter) return false
      if (projectFilter !== "all" && !e.key.startsWith(projectFilter)) return false
      if (priorityFilter !== "all" && e.priority !== priorityFilter) return false
      return true
    })
  }, [data, search, statusFilter, assigneeFilter, projectFilter, priorityFilter])

  const sortedEpics = useMemo(() => {
    const sorted = [...filteredEpics].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "key": cmp = a.key.localeCompare(b.key); break
        case "summary": cmp = a.summary.localeCompare(b.summary); break
        case "status": cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99); break
        case "assignee": cmp = (a.assignee || "ZZZ").localeCompare(b.assignee || "ZZZ"); break
        case "priority": {
          const po: Record<string, number> = { Highest: 0, High: 1, Medium: 2, Low: 3, Lowest: 4 }
          cmp = (po[a.priority] ?? 99) - (po[b.priority] ?? 99)
          break
        }
        case "updated": cmp = new Date(a.updated).getTime() - new Date(b.updated).getTime(); break
      }
      return sortDir === "desc" ? -cmp : cmp
    })
    return sorted
  }, [filteredEpics, sortField, sortDir])

  const groupedEpics = useMemo(() => {
    if (groupBy === "none") return { "All Epics": sortedEpics }
    const groups: Record<string, JiraIssue[]> = {}
    for (const e of sortedEpics) {
      let key: string
      switch (groupBy) {
        case "status": key = e.status; break
        case "assignee": key = e.assignee || "Unassigned"; break
        case "project": key = e.key.split("-")[0]; break
        case "priority": key = e.priority; break
        default: key = "Other"
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    }
    // Sort groups
    if (groupBy === "status") {
      const entries = Object.entries(groups).sort(([a], [b]) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99))
      return Object.fromEntries(entries)
    }
    return groups
  }, [sortedEpics, groupBy])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir(field === "updated" ? "desc" : "asc")
    }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn("h-3 w-3", sortField === field ? "text-foreground" : "text-muted-foreground/50")} />
      </div>
    </TableHead>
  )

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Portfolio</h1>
          {data && (
            <span className="text-sm text-muted-foreground">
              {filteredEpics.length} of {data.totalCount} epics
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Live from Jira
            </div>
          )}
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
          <Button variant="outline" size="sm" className="ml-2 h-6 text-xs" onClick={fetchData}>Retry</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Summary cards */}
            {data && (
              <div className="grid grid-cols-6 gap-3">
                {Object.entries(data.statusCounts)
                  .sort(([a], [b]) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99))
                  .map(([status, count]) => (
                    <Card
                      key={status}
                      className={cn(
                        "cursor-pointer border-border bg-card transition-all hover:border-foreground/20",
                        statusFilter === status && "ring-1 ring-foreground/20"
                      )}
                      onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                    >
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-muted-foreground">{status}</p>
                        <p className="mt-0.5 text-xl font-semibold tabular-nums">{count}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Filters bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search epics by key or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-8 w-44 text-sm">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="WE">WE</SelectItem>
                  <SelectItem value="ACTION">ACTION</SelectItem>
                  <SelectItem value="AIRR">AIRR</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 w-32 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Highest">Highest</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Lowest">Lowest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="h-8 w-36 text-sm">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="status">Group by Status</SelectItem>
                  <SelectItem value="assignee">Group by Assignee</SelectItem>
                  <SelectItem value="project">Group by Project</SelectItem>
                  <SelectItem value="priority">Group by Priority</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "all" || assigneeFilter !== "all" || projectFilter !== "all" || priorityFilter !== "all" || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setSearch("")
                    setStatusFilter("all")
                    setAssigneeFilter("all")
                    setProjectFilter("all")
                    setPriorityFilter("all")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Table */}
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              Object.entries(groupedEpics).map(([group, epics]) => (
                <Card key={group} className="border-border bg-card">
                  {groupBy !== "none" && (
                    <CardHeader className="pb-0 pt-4 px-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant="outline" className={STATUS_COLORS[group] || ""}>{group}</Badge>
                        <span className="text-xs text-muted-foreground">{epics.length} epics</span>
                      </CardTitle>
                    </CardHeader>
                  )}
                  <CardContent className={groupBy !== "none" ? "pt-3 px-4 pb-4" : "p-0"}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortHeader field="key">Key</SortHeader>
                          <SortHeader field="summary">Summary</SortHeader>
                          <SortHeader field="status">Status</SortHeader>
                          <SortHeader field="assignee">Assignee</SortHeader>
                          <SortHeader field="priority">Priority</SortHeader>
                          <TableHead>Fix Version</TableHead>
                          <SortHeader field="updated">Updated</SortHeader>
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {epics.map((epic) => (
                          <TableRow key={epic.key} className="group">
                            <TableCell className="font-mono text-xs font-medium">{epic.key}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm">{epic.summary}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[epic.status] || "")}>
                                {epic.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {epic.assignee || <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}
                            </TableCell>
                            <TableCell className={cn("text-xs font-medium", PRIORITY_COLORS[epic.priority] || "")}>
                              {epic.priority}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {epic.fixVersions.join(", ") || "--"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground" title={formatDate(epic.updated)}>
                                <Clock className="h-3 w-3" />
                                {formatRelative(epic.updated)}
                              </div>
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
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
