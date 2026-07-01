import { NextResponse } from "next/server"
import { getAllGitHubData } from "@/lib/api/github"

export async function GET() {
  try {
    const data = await getAllGitHubData()
    return NextResponse.json(data)
  } catch (err) {
    console.error("GitHub API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "GitHub fetch failed" },
      { status: 500 }
    )
  }
}
