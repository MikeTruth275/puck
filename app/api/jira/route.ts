import { NextResponse } from "next/server"
import { getAllPortfolioData } from "@/lib/api/jira"

export async function GET() {
  try {
    const data = await getAllPortfolioData()
    return NextResponse.json(data)
  } catch (err) {
    console.error("Jira API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Jira fetch failed" },
      { status: 500 }
    )
  }
}
