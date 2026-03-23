"use client"

import {
  FileText,
  LayoutGrid,
  AlertTriangle,
  Activity,
  GitBranch,
  MessageSquare,
  Plus,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { icon: FileText, label: "Weekly Brief", active: true },
  { icon: LayoutGrid, label: "Portfolio", active: false },
  { icon: AlertTriangle, label: "Risks", active: false },
  { icon: Activity, label: "PM Signals", active: false },
  { icon: GitBranch, label: "Friction Map", active: false },
  { icon: MessageSquare, label: "1:1 Builder", active: false },
]

interface AppSidebarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function AppSidebar({ darkMode, onToggleDarkMode }: AppSidebarProps) {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <span className="text-sm font-bold text-background">P</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Puck</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Weekly Run
          </Button>
        </div>
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-xs font-medium">MT</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Mike Taylor</span>
              <span className="text-xs text-muted-foreground">Product Ops</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
