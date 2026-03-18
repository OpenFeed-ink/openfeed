'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export function AIAssistant({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState('What should I build next?')
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const suggestedQuestions = [
    'What features are most requested?',
    'Which changelog entries are most viewed?',
    'How has feedback volume changed this month?',
    'What should I prioritize next?',
  ]

  const handleSubmit = async () => {
    if (!query.trim() || isStreaming) return
    setIsStreaming(true)
    setResponse('')
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, projectId }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        setResponse((prev) => prev + decoder.decode(value))
      }
    } catch {
      setResponse('Sorry, something went wrong.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-teal-600" />
        <CardTitle>AI Product Advisor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything..." />
          <Button onClick={handleSubmit} disabled={isStreaming} className="bg-teal-600 hover:bg-teal-700">
            {isStreaming ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => setQuery(q)}>
              {q}
            </Button>
          ))}
        </div>
        {response && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-muted/50 border">
            <p className="whitespace-pre-wrap text-sm">{response}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
