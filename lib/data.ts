// Seeded data for Puck Weekly Brief

export const pms = [
  { id: "doris", name: "Doris Jwo", initiative: "Writer Agent", avatar: "DJ" },
  { id: "patrick", name: "Patrick Lin", initiative: "Voice 2.0 / Enterprise Admin", avatar: "PL" },
  { id: "sam", name: "Sam Julien", initiative: "AIS 2.0 / LLM Gateway / DevX", avatar: "SJ" },
  { id: "ada", name: "Ada Li", initiative: "AIRR / Enterprise Brain", avatar: "AL" },
  { id: "helen", name: "Helen Ulasevich", initiative: "Strategic Deployment", avatar: "HU" },
  { id: "ashley", name: "Ashley Brooks", initiative: "MCP Team", avatar: "AB" },
]

export const summaryMetrics = [
  { label: "Material Changes", value: 7, delta: "+2", trend: "up" },
  { label: "Active Risks", value: 4, delta: "-1", trend: "down" },
  { label: "Cross-Team Frictions", value: 3, delta: "+1", trend: "up" },
  { label: "PM Signals to Review", value: 5, delta: "0", trend: "neutral" },
  { label: "Items for Waseem", value: 3, delta: "+1", trend: "up" },
]

export const changes = [
  {
    id: "ch1",
    initiative: "Writer Agent",
    pm: "Doris Jwo",
    changeType: "Timeline",
    before: "Mar 28 launch",
    after: "Apr 4 launch",
    whyItMatters: "Dependency on Enterprise Brain integration not confirmed until late Friday. One week buffer absorbed.",
    confidence: "High",
    category: "schedule",
  },
  {
    id: "ch2",
    initiative: "Voice 2.0",
    pm: "Patrick Lin",
    changeType: "Scope Cut",
    before: "Full admin console",
    after: "Core admin only",
    whyItMatters: "Descoped advanced permissions to preserve Q1 milestone. Will revisit in Q2.",
    confidence: "High",
    category: "scope",
  },
  {
    id: "ch3",
    initiative: "AIS 2.0",
    pm: "Sam Julien",
    changeType: "Sequencing",
    before: "LLM Gateway → DevX",
    after: "DevX → LLM Gateway",
    whyItMatters: "Internal tooling team needs DevX first for their Q2 planning. Gateway can slip 2 weeks without customer impact.",
    confidence: "Medium",
    category: "dependency",
  },
  {
    id: "ch4",
    initiative: "AIRR",
    pm: "Ada Li",
    changeType: "Owner Change",
    before: "Ada Li (sole)",
    after: "Ada Li + Helen U.",
    whyItMatters: "Strategic Deployment overlap identified. Helen joining to align enterprise rollout.",
    confidence: "High",
    category: "ownership",
  },
  {
    id: "ch5",
    initiative: "MCP Team",
    pm: "Ashley Brooks",
    changeType: "Risk Escalation",
    before: "Green",
    after: "Yellow",
    whyItMatters: "Key engineer out sick, sprint velocity dropped 40%. Recovery plan TBD.",
    confidence: "Medium",
    category: "risk",
  },
]

export const risks = [
  {
    id: "r1",
    title: "Enterprise Brain Integration Delay",
    category: "Dependency",
    evidence: "Jira: EB-1247 blocked since Mar 12. Slack: #writer-agent shows escalation thread.",
    interpretation: "Writer Agent launch at risk if EB team doesn't confirm API spec by Mar 22.",
    impact: "High",
    confidence: "High",
    recommendation: "Escalate to Waseem. Request EB team prioritization.",
    owner: "Doris Jwo",
    initiative: "Writer Agent",
  },
  {
    id: "r2",
    title: "Voice 2.0 QA Bandwidth",
    category: "Resource",
    evidence: "GitHub: 47 open PRs. Jira: QA backlog at 3 sprints.",
    interpretation: "QA team stretched thin. Risk of shipping with insufficient test coverage.",
    impact: "Medium",
    confidence: "Medium",
    recommendation: "Consider phased rollout with expanded monitoring.",
    owner: "Patrick Lin",
    initiative: "Voice 2.0",
  },
  {
    id: "r3",
    title: "AIRR Customer Commitment Gap",
    category: "Strategic",
    evidence: "Docs: Customer brief shows narrow use case. Slack: Sales thread requesting broader scope.",
    interpretation: "Current execution may not meet full customer expectation. Misalignment risk.",
    impact: "High",
    confidence: "Medium",
    recommendation: "Sync with Sales before next sprint planning.",
    owner: "Ada Li",
    initiative: "AIRR",
  },
  {
    id: "r4",
    title: "LLM Gateway Cost Model Uncertainty",
    category: "Financial",
    evidence: "Docs: Cost model draft incomplete. Slack: Finance flagged missing projections.",
    interpretation: "Launch without clear cost model may trigger budget review.",
    impact: "Medium",
    confidence: "Low",
    recommendation: "Complete cost model before Apr 1 leadership review.",
    owner: "Sam Julien",
    initiative: "AIS 2.0",
  },
]

export const frictions = [
  { team1: "Writer Agent", team2: "Enterprise Brain", level: "high", issue: "API spec delays, unclear ownership" },
  { team1: "Voice 2.0", team2: "Enterprise Admin", level: "moderate", issue: "Permissions model misalignment" },
  { team1: "AIRR", team2: "Strategic Deployment", level: "weak", issue: "Rollout sequencing TBD" },
  { team1: "AIS 2.0", team2: "MCP Team", level: "moderate", issue: "Shared infrastructure dependencies" },
]

export const pmSignals = [
  {
    pm: "Doris Jwo",
    initiative: "Writer Agent",
    scores: {
      commitmentIntegrity: 72,
      varianceFromPlan: 65,
      communicationQuality: 88,
      dependencyHealth: 45,
      executionControl: 70,
      strategicAltitude: 82,
    },
    interpretation: "Strong communication but dependency management needs attention. External blockers creating variance.",
  },
  {
    pm: "Patrick Lin",
    initiative: "Voice 2.0",
    scores: {
      commitmentIntegrity: 85,
      varianceFromPlan: 78,
      communicationQuality: 75,
      dependencyHealth: 80,
      executionControl: 82,
      strategicAltitude: 70,
    },
    interpretation: "Solid execution. Could elevate strategic framing in updates.",
  },
  {
    pm: "Sam Julien",
    initiative: "AIS 2.0",
    scores: {
      commitmentIntegrity: 90,
      varianceFromPlan: 88,
      communicationQuality: 92,
      dependencyHealth: 85,
      executionControl: 88,
      strategicAltitude: 90,
    },
    interpretation: "High performer across all dimensions. Model for others.",
  },
  {
    pm: "Ada Li",
    initiative: "AIRR",
    scores: {
      commitmentIntegrity: 68,
      varianceFromPlan: 55,
      communicationQuality: 72,
      dependencyHealth: 60,
      executionControl: 65,
      strategicAltitude: 58,
    },
    interpretation: "Execution under stress. Strategic scope may be too narrow for customer needs.",
  },
]

export const contextSignals = [
  { type: "Manual Updates", description: "3 PMs manually syncing Jira → Slack weekly", impact: "High", opportunity: "Automate status propagation" },
  { type: "Stale Context", description: "Enterprise Brain docs last updated 12 days ago", impact: "Medium", opportunity: "Trigger doc refresh workflow" },
  { type: "Fragmented Comms", description: "Voice 2.0 updates split across 4 channels", impact: "Medium", opportunity: "Consolidate to single source" },
  { type: "Missing Artifacts", description: "No reusable decision log for AIRR scope cuts", impact: "Low", opportunity: "Create decision template" },
]

export const recommendations = [
  { id: 1, text: "Escalate Enterprise Brain API spec to Waseem — Writer Agent launch depends on resolution by Mar 22." },
  { id: 2, text: "Review AIRR scope with Sales before next sprint — customer expectation gap emerging." },
  { id: 3, text: "Check in on MCP Team recovery plan — velocity drop may cascade to Q2." },
  { id: 4, text: "Recognize Sam Julien's execution quality — consider as model for PM operating rhythm." },
  { id: 5, text: "Discuss Voice 2.0 phased rollout option if QA bandwidth doesn't recover." },
]

export const oneOnOneBrief = {
  bluf: "Portfolio trending stable with one high-priority escalation. Enterprise Brain dependency threatens Writer Agent launch. AIRR scope alignment needed. MCP velocity risk emerging.",
  topSignals: [
    "Writer Agent launch slipped 1 week due to EB dependency",
    "Voice 2.0 descoped to preserve milestone",
    "AIRR customer expectation gap identified",
  ],
  biggestRisks: [
    "Enterprise Brain API spec not confirmed — escalation needed",
    "MCP Team velocity drop — recovery plan TBD",
  ],
  recommendations: [
    "Request EB team prioritization from Waseem",
    "Sync with Sales on AIRR scope before sprint planning",
  ],
  calibrationTopics: [
    "Is Writer Agent slip acceptable given EB dependency?",
    "Should we proactively loop in Sales on AIRR scope?",
    "MCP staffing options if recovery doesn't materialize?",
  ],
}

export const evidenceData = {
  jira: [
    { id: "EB-1247", title: "Enterprise Brain API Specification", status: "Blocked", updated: "Mar 12", assignee: "Chen Wei", description: "Waiting on architecture review. Blocking Writer Agent integration." },
    { id: "WA-892", title: "Writer Agent Launch Prep", status: "In Progress", updated: "Mar 15", assignee: "Doris Jwo", description: "All items green except EB dependency." },
    { id: "V2-445", title: "Voice 2.0 Admin Console", status: "Scope Changed", updated: "Mar 14", assignee: "Patrick Lin", description: "Descoped advanced permissions to core only." },
  ],
  github: [
    { repo: "writer-agent", prs: 12, merged: 8, open: 4, activity: "High", lastCommit: "2 hours ago" },
    { repo: "voice-2", prs: 47, merged: 31, open: 16, activity: "Very High", lastCommit: "34 min ago" },
    { repo: "ais-2", prs: 23, merged: 20, open: 3, activity: "Moderate", lastCommit: "1 day ago" },
    { repo: "airr-core", prs: 8, merged: 5, open: 3, activity: "Low", lastCommit: "3 days ago" },
  ],
  slack: [
    { channel: "#writer-agent", message: "Escalating EB-1247 to leadership. Need resolution by EOW.", author: "Doris Jwo", time: "Yesterday 4:32 PM" },
    { channel: "#voice-2-eng", message: "QA backlog update: 47 items, 3 sprint capacity. Discussing prioritization.", author: "Patrick Lin", time: "Today 9:15 AM" },
    { channel: "#airr-team", message: "Sales sync needed — customer brief doesn't match current scope.", author: "Ada Li", time: "Monday 2:00 PM" },
  ],
  docs: [
    { title: "Enterprise Brain Architecture", lastUpdated: "Mar 6", status: "Stale", owner: "Chen Wei" },
    { title: "Writer Agent Launch Plan", lastUpdated: "Mar 15", status: "Current", owner: "Doris Jwo" },
    { title: "AIRR Customer Brief", lastUpdated: "Mar 10", status: "Review Needed", owner: "Ada Li" },
    { title: "Voice 2.0 QA Strategy", lastUpdated: "Mar 14", status: "Current", owner: "Patrick Lin" },
  ],
}
