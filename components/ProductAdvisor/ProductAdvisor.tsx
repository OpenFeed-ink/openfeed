"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Send, RotateCcw } from "lucide-react"

const SUGGESTED_QUESTIONS = [
  "What should I build next?",
  "What are users most frustrated about?",
  "What quick wins should I prioritize?",
  "What themes keep coming up in feedback?",
  "What features have the most demand right now?",
  "What did we recently ship that users wanted?",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ProductAdvisorProps {
  projectId: string
}

export function ProductAdvisor({ projectId }: ProductAdvisorProps) {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStream, setCurrentStream] = useState("")

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || question).trim()
    if (!q || isLoading) return

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: q }
    setMessages(prev => [...prev, userMessage])
    setQuestion("")
    setIsLoading(true)
    setCurrentStream("")

    // Build conversation history for multi-turn support
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const response = await fetch(`/api/projects/${projectId}/advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      })

      if (!response.ok) throw new Error("Failed to get response")
      if (!response.body) throw new Error("No response body")

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk
        setCurrentStream(fullResponse)
      }

      // Move streamed response to messages
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: fullResponse }])
      setCurrentStream("")

    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }])
      setCurrentStream("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setCurrentStream("")
    setQuestion("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const isEmpty = messages.length === 0 && !isLoading

  return (
    <div className="flex flex-col h-full max-h-175 border rounded-xl overflow-hidden bg-background">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Product Advisor</span>
          <Badge variant="secondary" className="text-xs">AI</Badge>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            New conversation
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Empty state — show suggested questions */}
        {isEmpty && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-4">
              Ask anything about your feedback, roadmap, or what to build next.
              <br />
              I have access to all your feature requests and roadmap data.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="text-left text-sm px-3 py-2 rounded-lg border border-dashed 
                             hover:border-primary hover:bg-primary/5 transition-colors
                             text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message history */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${message.role === "user"
                ? "bg-primary text-primary-foreground ml-8"
                : "bg-muted text-foreground mr-8"
                }`}
            >
              {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl px-4 py-2.5 text-sm bg-muted text-foreground mr-8">
              {currentStream ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {currentStream}
                  </ReactMarkdown>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Analyzing your feedback data...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your feedback, priorities, or roadmap..."
            className="resize-none text-sm min-h-10 max-h-30"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={() => handleAsk()}
            disabled={!question.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
