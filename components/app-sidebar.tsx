"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutGrid,
  AlertTriangle,
  Activity,
  GitBranch,
  MessageSquare,
  Bot,
  Plus,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { icon: FileText, label: "Weekly Brief", href: "/" },
  { icon: Bot, label: "Ask Puck", href: "/ask-puck" },
  { icon: LayoutGrid, label: "Portfolio", href: "/portfolio" },
  { icon: AlertTriangle, label: "Risks", href: "/risks" },
  { icon: Activity, label: "PM Signals", href: "/pm-signals" },
  { icon: GitBranch, label: "Friction Map", href: "/friction-map" },
  { icon: MessageSquare, label: "1:1 Builder", href: "/one-on-one" },
]

interface AppSidebarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function AppSidebar({ darkMode, onToggleDarkMode }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <span className="text-sm font-bold text-background">P</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Puck</span>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Weekly Run
          </Button>
        </div>
      </nav>

      <Separator />

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
