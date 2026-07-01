"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Printer,
  Download,
  Clock,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Signal {
  signal: string
  whyICare: string
  whatItSuggests: string
}

interface Risk {
  title: string
  evidence: string
  whyItMatters: string
  myRead: string
}

interface PMSignal {
  pm: string
  signal: string
}

interface Recommendation {
  text: string
  urgency: "now" | "this-week" | "next-week"
}

interface CheatSheet {
  whatChanged: string[]
  whatIsAtRisk: string[]
  pmQuality: string[]
  whatIRecommend: string[]
  whatINeedFromWaseem: string[]
}

interface BriefData {
  brief: {
    bluf: string
    topSignals: Signal[]
    risks: Risk[]
    pmSignals: PMSignal[]
    recommendations: Recommendation[]
    calibrationQuestions: string[]
    cheatSheet: CheatSheet
  }
  meta: {
    generatedAt: string
    portfolioSize: number
    blockedCount: number
    shippedCount: number
    prsMerged: number
    q1Progress: { done: number; total: number }
  }
}

const URGENCY_COLORS = {
  "now": "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  "this-week": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  "next-week": "border-muted text-muted-foreground",
}

export default function OneOnOnePage() {
  const [data, setData] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/one-on-one")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `API returned ${res.status}`)
      }
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate")
    } finally {
      setLoading(false)
    }
  }

  const copyAsText = () => {
    if (!data) return
    const b = data.brief
    const text = [
      `TUESDAY 1:1 WITH WASEEM`,
      `Generated: ${new Date(data.meta.generatedAt).toLocaleDateString()}`,
      ``,
      `BLUF`,
      b.bluf,
      ``,
      `TOP SIGNALS`,
      ...b.topSignals.map((s, i) => `${i + 1}. ${s.signal}\n   Why I care: ${s.whyICare}\n   What it suggests: ${s.whatItSuggests}`),
      ``,
      `RISKS`,
      ...b.risks.map((r, i) => `${i + 1}. ${r.title}\n   Evidence: ${r.evidence}\n   Why it matters: ${r.whyItMatters}\n   My read: ${r.myRead}`),
      ``,
      `PM SIGNALS`,
      ...b.pmSignals.map((p) => `- ${p.pm}: ${p.signal}`),
      ``,
      `RECOMMENDATIONS`,
      ...b.recommendations.map((r, i) => `${i + 1}. [${r.urgency}] ${r.text}`),
      ``,
      `CALIBRATE WITH WASEEM`,
      ...b.calibrationQuestions.map((q, i) => `${i + 1}. ${q}`),
      ``,
      `---`,
      `CHEAT SHEET`,
      ``,
      `What changed?`,
      ...b.cheatSheet.whatChanged.map((b) => `- ${b}`),
      ``,
      `What is at risk?`,
      ...b.cheatSheet.whatIsAtRisk.map((b) => `- ${b}`),
      ``,
      `PM quality signals?`,
      ...b.cheatSheet.pmQuality.map((b) => `- ${b}`),
      ``,
      `What I recommend?`,
      ...b.cheatSheet.whatIRecommend.map((b) => `- ${b}`),
      ``,
      `What I need from Waseem?`,
      ...b.cheatSheet.whatINeedFromWaseem.map((b) => `- ${b}`),
    ].join("\n")

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">1:1 Builder</h1>
          <Badge variant="secondary" className="text-xs">Tuesday with Waseem</Badge>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <>
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={copyAsText}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy as Text"}
              </Button>
            </>
          )}
          <Button size="sm" className="h-8 gap-1.5" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {data ? "Regenerate" : "Generate Brief"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />{error}
          <Button variant="outline" size="sm" className="ml-2 h-6 text-xs" onClick={generate}>Retry</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            {!data && !loading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Generate your 1:1 brief</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Pulls live data from Jira and GitHub, synthesizes via Palmyra into a structured brief
                  for your Tuesday meeting with Waseem.
                </p>
                <Button className="mt-6 gap-2" onClick={generate}>
                  <Sparkles className="h-4 w-4" />
                  Generate Brief
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Pulling portfolio data and synthesizing with Palmyra...
                </p>
              </div>
            )}

            {data && !loading && (
              <div className="grid grid-cols-3 gap-6">
                {/* Main brief - 2 columns */}
                <div className="col-span-2 space-y-6">
                  {/* BLUF */}
                  <Card className="border-border bg-card">
                    <CardContent className="p-6">
                      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Bottom Line
                      </h2>
                      <p className="text-base leading-relaxed">{data.brief.bluf}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{data.meta.portfolioSize} epics tracked</span>
                        <span>·</span>
                        <span>{data.meta.blockedCount} blocked</span>
                        <span>·</span>
                        <span>{data.meta.shippedCount} shipped (14d)</span>
                        <span>·</span>
                        <span>{data.meta.prsMerged} PRs merged (7d)</span>
                        <span>·</span>
                        <span>Q1: {data.meta.q1Progress.done}/{data.meta.q1Progress.total}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Signals */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />Top Signals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.brief.topSignals.map((signal, idx) => (
                        <div key={idx} className="rounded-lg border border-border p-4">
                          <p className="text-sm font-medium">{signal.signal}</p>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-medium uppercase text-muted-foreground">Why I care</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{signal.whyICare}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium uppercase text-muted-foreground">What it suggests</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{signal.whatItSuggests}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Risks */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 text-red-500" />Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {data.brief.risks.map((risk, idx) => (
                        <div key={idx} className="rounded-lg border border-border p-4">
                          <p className="text-sm font-medium">{risk.title}</p>
                          <div className="mt-2 space-y-1.5">
                            <p className="text-xs"><span className="font-medium text-muted-foreground">Evidence:</span> {risk.evidence}</p>
                            <p className="text-xs"><span className="font-medium text-muted-foreground">Why it matters:</span> {risk.whyItMatters}</p>
                            <p className="text-xs"><span className="font-medium text-foreground">My read:</span> {risk.myRead}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* PM Signals */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">PM Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.brief.pmSignals.map((pm) => (
                        <div key={pm.pm} className="flex items-start gap-3 rounded-lg border border-border p-3">
                          <span className="shrink-0 text-sm font-medium">{pm.pm}</span>
                          <p className="text-xs text-muted-foreground">{pm.signal}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Lightbulb className="h-4 w-4" />Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.brief.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                          <Badge variant="outline" className={cn("shrink-0 text-[10px]", URGENCY_COLORS[rec.urgency])}>
                            {rec.urgency}
                          </Badge>
                          <p className="text-xs">{rec.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Calibration Questions */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <HelpCircle className="h-4 w-4" />Calibrate with Waseem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {data.brief.calibrationQuestions.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs">
                            <span className="mt-0.5 font-medium text-muted-foreground">{idx + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Cheat sheet - 1 column */}
                <div className="space-y-6">
                  <Card className="sticky top-20 border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />Cheat Sheet
                        </CardTitle>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(data.meta.generatedAt).toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric"
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">1. What changed?</h4>
                        <ul className="mt-1.5 space-y-1">
                          {data.brief.cheatSheet.whatChanged.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">2. What is at risk?</h4>
                        <ul className="mt-1.5 space-y-1">
                          {data.brief.cheatSheet.whatIsAtRisk.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">3. PM quality?</h4>
                        <ul className="mt-1.5 space-y-1">
                          {data.brief.cheatSheet.pmQuality.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">4. Recommendations?</h4>
                        <ul className="mt-1.5 space-y-1">
                          {data.brief.cheatSheet.whatIRecommend.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">5. What I need from Waseem?</h4>
                        <ul className="mt-1.5 space-y-1">
                          {data.brief.cheatSheet.whatINeedFromWaseem.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={copyAsText}>
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={generate}>
                          <Sparkles className="h-3.5 w-3.5" />
                          Regenerate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
