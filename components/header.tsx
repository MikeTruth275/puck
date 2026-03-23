"use client"

import {
  RefreshCw,
  Download,
  Sparkles,
  Search,
  ChevronDown,
  Clock,
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

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {/* Left section */}
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

      {/* Center section - Filters */}
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

      {/* Right section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated 34m ago</span>
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
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
