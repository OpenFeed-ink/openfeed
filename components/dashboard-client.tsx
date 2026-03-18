'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
} from 'recharts'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  ArrowUp, 
  FileText, 
  Eye, 
  Sparkles, 
  Send,
  TrendingUp,
  BarChart3,
  Activity,
  Zap 
} from 'lucide-react'
import { AnalyticsData } from '@/app/(dashboard)/projects/[id]/page'

interface DashboardClientProps {
  data: AnalyticsData
  projectId: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

export function DashboardClient({ data, projectId }: DashboardClientProps) {
  const router = useRouter()
  const [aiQuery, setAiQuery] = useState('What should I build next?')
  const [aiResponse, setAiResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const handleBarClick = (payload: any) => {
    // Type-safe access
    const featureId = payload?.activePayload?.[0]?.payload?.id
    if (featureId) {
      router.push(`/projects/${projectId}/feedback?featureId=${featureId}`)
    }
  }

  const handleAiSubmit = async () => {
    if (!aiQuery.trim() || isStreaming) return
    setIsStreaming(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, projectId }),
      })

      if (!response.ok) throw new Error('Failed to stream')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        setAiResponse((prev) => prev + text)
      }
    } catch (error) {
      setAiResponse('Sorry, something went wrong.')
    } finally {
      setIsStreaming(false)
    }
  }

  const suggestedQuestions = [
    'What features are most requested?',
    'Which changelog entries are most viewed?',
    'How has feedback volume changed this month?',
    'What should I prioritize next?',
  ]

  const overviewCards = [
    {
      title: 'Total Feedback',
      value: data.overview.totalFeedback,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Upvotes',
      value: data.overview.totalUpvotes,
      icon: ArrowUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Changelog Entries',
      value: data.overview.totalChangelogEntries,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Widget Opens (30d)',
      value: data.overview.widgetOpensThisMonth,
      icon: Eye,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Section 1: Overview Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * idx, type: 'spring' }}
                  className="text-3xl font-bold"
                >
                  {card.value.toLocaleString()}
                </motion.div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Section 2: Top Requested Features (Bar Chart) */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <CardTitle>Top Requested Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topFeatures}
                  layout="vertical"
                  margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                  onClick={handleBarClick}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--accent)' }}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <Bar
                    dataKey="upvotesCount"
                    fill="#14b8a6"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Feedback Trend (Line Chart) */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            <CardTitle>Feedback Submissions (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.feedbackTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 4: Changelog Engagement (Table) */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Zap className="h-5 w-5 text-teal-600" />
            <CardTitle>Changelog Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.changelogEngagement.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell>{new Date(entry.publishedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{entry.viewCount}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 5: Widget Activity (Line Chart) */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            <CardTitle>Widget Opens (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.widgetActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 6: Ask AI */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <CardTitle>AI Product Advisor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1"
                placeholder="Ask anything about your product..."
              />
              <Button
                onClick={handleAiSubmit}
                disabled={isStreaming}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isStreaming ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setAiQuery(q)}
                  className="hover:bg-teal-50 dark:hover:bg-teal-950/30"
                >
                  {q}
                </Button>
              ))}
            </div>

            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <p className="whitespace-pre-wrap text-sm">{aiResponse}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
