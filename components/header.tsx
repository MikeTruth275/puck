"use client"

import {
  RefreshCw,
  Download,
  Sparkles,
  Search,
  ChevronDown,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  state: "idle" | "loading" | "success" | "error"
  lastUpdated: Date | null
  onRefresh: () => void
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ago`
}

export function Header({ state, lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Weekly Brief</h1>
        
        <Select defaultValue="week-12">
          <SelectTrigger className="h-8 w-32 text-sm">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week-12">Week 12</SelectItem>
            <SelectItem value="week-11">Week 11</SelectItem>
            <SelectItem value="week-10">Week 10</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              Compare: Week 11
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Week 11</DropdownMenuItem>
            <DropdownMenuItem>Week 10</DropdownMenuItem>
            <DropdownMenuItem>Week 9</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              PM
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All PMs</DropdownMenuItem>
            <DropdownMenuItem>Doris Jwo</DropdownMenuItem>
            <DropdownMenuItem>Patrick Lin</DropdownMenuItem>
            <DropdownMenuItem>Sam Julien</DropdownMenuItem>
            <DropdownMenuItem>Ada Li</DropdownMenuItem>
            <DropdownMenuItem>Ashley Brooks</DropdownMenuItem>
            <DropdownMenuItem>Helen Ulasevich</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
              Initiative
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All Initiatives</DropdownMenuItem>
            <DropdownMenuItem>Writer Agent</DropdownMenuItem>
            <DropdownMenuItem>Voice 2.0</DropdownMenuItem>
            <DropdownMenuItem>AIS 2.0</DropdownMenuItem>
            <DropdownMenuItem>AIRR</DropdownMenuItem>
            <DropdownMenuItem>MCP / Connectors</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-40 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {state === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : state === "success" ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          <span>
            {state === "loading"
              ? "Updating..."
              : lastUpdated
                ? `Updated ${formatTimeAgo(lastUpdated)}`
                : "Not yet loaded"}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onRefresh}
          disabled={state === "loading"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>

        <Button size="sm" className="h-8 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Generate 1:1 Brief
        </Button>
      </div>
    </header>
  )
}
