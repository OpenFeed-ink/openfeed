'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ArrowUp, FileText, Eye } from 'lucide-react'
import { RangeSelector } from './RangeSelector'
import { useRange } from '@/hooks/useRange'
import { TimeRange } from '@/type'

const cards = [
  { title: 'Total Feedback', icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { title: 'Total Upvotes', icon: ArrowUp, color: 'text-green-600', bgColor: 'bg-green-100' },
  { title: 'Changelog Entries', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { title: 'Widget Opens', icon: Eye, color: 'text-amber-600', bgColor: 'bg-amber-100' },
]

export function OverviewCards({ initialRange, data }: { initialRange: TimeRange, data: any }) {
  const { range, setRange } = useRange('overviewRange', initialRange)

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <RangeSelector value={range} onChange={setRange} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon
          const value = data[Object.keys(data)[idx]]
          return (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
