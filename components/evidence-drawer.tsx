"use client"

import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { evidenceData } from "@/lib/data"
import { cn } from "@/lib/utils"

interface EvidenceDrawerProps {
  open: boolean
  onClose: () => void
  selectedItem: string | null
}

export function EvidenceDrawer({ open, onClose, selectedItem }: EvidenceDrawerProps) {
  if (!open) return null

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">Evidence</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jira" className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-4">
          <TabsTrigger value="jira" className="text-xs">Jira</TabsTrigger>
          <TabsTrigger value="github" className="text-xs">GitHub</TabsTrigger>
          <TabsTrigger value="slack" className="text-xs">Slack</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="jira" className="m-0 p-4">
            <div className="space-y-3">
              {evidenceData.jira.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-medium text-foreground">{item.id}</code>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            item.status === "Blocked"
                              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                              : item.status === "Scope Changed"
                              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs font-medium">{item.title}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">{item.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{item.assignee}</span>
                    <span>·</span>
                    <span>Updated {item.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="github" className="m-0 p-4">
            <div className="space-y-3">
              {evidenceData.github.map((item) => (
                <div key={item.repo} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-medium text-foreground">{item.repo}</code>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        item.activity === "Very High"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : item.activity === "High"
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                          : item.activity === "Low"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {item.activity}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted p-1.5">
                      <p className="text-sm font-semibold">{item.prs}</p>
                      <p className="text-[10px] text-muted-foreground">PRs</p>
                    </div>
                    <div className="rounded-md bg-muted p-1.5">
                      <p className="text-sm font-semibold">{item.merged}</p>
                      <p className="text-[10px] text-muted-foreground">Merged</p>
                    </div>
                    <div className="rounded-md bg-muted p-1.5">
                      <p className="text-sm font-semibold">{item.open}</p>
                      <p className="text-[10px] text-muted-foreground">Open</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Last commit: {item.lastCommit}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="slack" className="m-0 p-4">
            <div className="space-y-3">
              {evidenceData.slack.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-muted-foreground">{item.channel}</code>
                  </div>
                  <p className="mt-2 text-xs text-foreground">"{item.message}"</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground">{item.author}</span>
                    <span>·</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="m-0 p-4">
            <div className="space-y-3">
              {evidenceData.docs.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium">{item.title}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        item.status === "Current"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : item.status === "Stale"
                          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{item.owner}</span>
                    <span>·</span>
                    <span>Updated {item.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
