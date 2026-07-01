"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Loader2, Send } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function AskPuckPage() {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [input, setInput] = useState("")
  const busy = status === "submitted" || status === "streaming"

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
          <Bot className="h-4 w-4 text-background" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Ask Puck</h1>
          <p className="text-xs text-muted-foreground">
            Answers use your Weekly Brief data (risks, changes, PM signals, and more).
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-4">
          {messages.length === 0 && (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Try: &ldquo;What should I escalate to Waseem this week?&rdquo; or &ldquo;Summarize risks for Writer
              Agent.&rdquo;
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-card-foreground",
                )}
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? <span key={index}>{part.text}</span> : null,
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking…
              <button
                type="button"
                className="ml-2 underline underline-offset-2 hover:text-foreground"
                onClick={() => stop()}
              >
                Stop
              </button>
            </div>
          )}
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background px-6 py-3">
        <form
          className="mx-auto flex max-w-2xl gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const text = input.trim()
            if (!text || busy) return
            sendMessage({ text })
            setInput("")
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                const text = input.trim()
                if (!text || busy) return
                sendMessage({ text })
                setInput("")
              }
            }}
            placeholder="Ask about risks, PMs, initiatives…"
            disabled={busy}
            rows={2}
            className="min-h-[44px] resize-none text-sm"
          />
          <Button type="submit" size="icon" className="h-[44px] w-[44px] shrink-0" disabled={busy || !input.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
