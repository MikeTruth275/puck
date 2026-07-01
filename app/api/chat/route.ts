import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { getPuckDataJsonForPrompt } from "@/lib/puck-context"

export const maxDuration = 120

const writer = createOpenAICompatible({
  name: "writer",
  apiKey: process.env.WRITER_API_KEY!,
  baseURL: "https://api.writer.com/v1",
})

export async function POST(req: Request) {
  if (!process.env.WRITER_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing WRITER_API_KEY." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    )
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const portfolioJson = await getPuckDataJsonForPrompt()

  const system = `You are Puck, a portfolio intelligence assistant for Mike Taylor, Product Operations Lead at Writer (Series C AI company).

Use ONLY the following live portfolio data as your source of truth. This data is pulled in real-time from Jira, GitHub, and Confluence. If the user asks about something not present in the data, say you do not have that information in the current dataset.

Be direct, specific, and concise. Cite Jira keys, PM names, initiative names, and link to Confluence pages when relevant. Use BLUF (Bottom Line Up Front) style. No corporate buzzwords.

When referencing Confluence pages, include the page title and URL so Mike can click through.

## PM Ownership
- Doris Jwo: Writer Agent / Playbooks / Skills
- Patrick Lin: Voice 2.0 / Enterprise Admin / Billing
- Sam Julien: AIS 2.0 / LLM Gateway / DevX / Plugins
- Ada Li: AIRR / Enterprise Brain
- Helen Ulasevich: Strategic Deployment / Extensions
- Ashley Brooks: MCP / Connectors

## Live Portfolio Data (Jira + GitHub + Confluence JSON)
${portfolioJson}`

  const result = streamText({
    model: writer.chatModel("palmyra-x5"),
    system,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
