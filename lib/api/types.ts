// Shared types for the Puck data model
// These match the structures in lib/data.ts that the UI components consume

export interface PM {
  id: string
  name: string
  initiative: string
  avatar: string
}

export interface SummaryMetric {
  label: string
  value: number
  delta: string
  trend: "up" | "down" | "neutral"
}

export interface Change {
  id: string
  initiative: string
  pm: string
  changeType: string
  before: string
  after: string
  whyItMatters: string
  confidence: "High" | "Medium" | "Low"
  category: "schedule" | "scope" | "dependency" | "ownership" | "risk"
}

export interface Risk {
  id: string
  title: string
  category: "Dependency" | "Resource" | "Strategic" | "Financial"
  evidence: string
  interpretation: string
  impact: "High" | "Medium" | "Low"
  confidence: "High" | "Medium" | "Low"
  recommendation: string
  owner: string
  initiative: string
}

export interface Friction {
  team1: string
  team2: string
  level: "high" | "moderate" | "weak"
  issue: string
}

export interface PMSignal {
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
  interpretation: string
}

export interface ContextSignal {
  type: string
  description: string
  impact: "High" | "Medium" | "Low"
  opportunity: string
}

export interface Recommendation {
  id: number
  text: string
}

export interface OneOnOneBrief {
  bluf: string
  topSignals: string[]
  biggestRisks: string[]
  recommendations: string[]
  calibrationTopics: string[]
}

export interface JiraEvidence {
  id: string
  title: string
  status: string
  updated: string
  assignee: string
  description: string
}

export interface GitHubEvidence {
  repo: string
  prs: number
  merged: number
  open: number
  activity: string
  lastCommit: string
}

export interface SlackEvidence {
  channel: string
  message: string
  author: string
  time: string
}

export interface DocEvidence {
  title: string
  lastUpdated: string
  status: string
  owner: string
}

export interface EvidenceData {
  jira: JiraEvidence[]
  github: GitHubEvidence[]
  slack: SlackEvidence[]
  docs: DocEvidence[]
}

export interface WeeklyBriefData {
  pms: PM[]
  summaryMetrics: SummaryMetric[]
  changes: Change[]
  risks: Risk[]
  frictions: Friction[]
  pmSignals: PMSignal[]
  contextSignals: ContextSignal[]
  recommendations: Recommendation[]
  oneOnOneBrief: OneOnOneBrief
  evidenceData: EvidenceData
}
