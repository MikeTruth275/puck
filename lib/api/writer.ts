const WRITER_API_KEY = process.env.WRITER_API_KEY!
const WRITER_API_URL = "https://api.writer.com/v1/chat"

interface WriterMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface WriterChatResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatCompletion(
  messages: WriterMessage[],
  options: { model?: string; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { model = "palmyra-x5", maxTokens = 8192, temperature = 0.7 } = options

  const res = await fetch(WRITER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WRITER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Writer API error (${res.status}): ${text}`)
  }

  const data: WriterChatResponse = await res.json()

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Writer API returned empty response")
  }

  return data.choices[0].message.content
}
