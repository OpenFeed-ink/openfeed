'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, MouseHandlerDataParam } from 'recharts'
import { RangeSelector } from './RangeSelector'
import { useRange } from '@/hooks/useRange'
import { useRouter } from 'next/navigation'
import { TimeRange } from '@/type'

export function TopFeaturesChart({ projectId, initialRange, data }: {
  projectId: string,
  initialRange: TimeRange,
  data: {
    id: string;
    title: string;
    upvotesCount: number;
  }[]
}) {
  const router = useRouter()
  const { range, setRange } = useRange('topFeaturesRange', initialRange)

  const handleBarClick = (payload: MouseHandlerDataParam) => {
    const featureindex = payload.activeIndex
    const index = Number(featureindex)
    if (index || index === 0) {
      const feature = data[index]
      router.push(`/projects/${projectId}/feature-requests?featureId=${feature.id}`)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-600" />
          <CardTitle>Top Requested Features</CardTitle>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </CardHeader>
      <CardContent>
        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              onClick={handleBarClick}
              width={"100%"}
              height={"100%"}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="title"
                width={120}           // give extra width if possible
                tick={{ fontSize: 12 }}
                tickFormatter={(title) =>
                  title.length > 20 ? title.slice(0, 20) + "…" : title
                }
              />
              <Tooltip
                cursor={{ fill: 'var(--secondary)' }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                }}
              />
              <Bar
                dataKey="upvotesCount"
                fill="var(--primary)"
                radius={[0, 4, 4, 0]}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
