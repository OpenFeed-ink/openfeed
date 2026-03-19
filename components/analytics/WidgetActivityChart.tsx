'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RangeSelector } from './RangeSelector'
import { useRange } from '@/hooks/useRange'
import { TimeRange } from '@/type'


export function WidgetActivityChart({ initialRange, data }: {
  initialRange: TimeRange, data: {
    date: Date;
    opens: number;
  }[]
}) {
  const { range, setRange } = useRange('widgetRange', initialRange)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <CardTitle>Widget Opens</CardTitle>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </CardHeader>
      <CardContent>
        <div className="min-h-80 h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
              />
              <Line type="monotone" dataKey="opens" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
