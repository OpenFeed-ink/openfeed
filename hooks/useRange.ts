'use client'

import { TimeRange } from '@/type'
import { useRouter, useSearchParams } from 'next/navigation'

export function useRange(paramName: string, defaultValue: TimeRange = 'month') {
  const router = useRouter()
  const searchParams = useSearchParams()
  const range = (searchParams.get(paramName) as TimeRange) || defaultValue

  const setRange = (newRange: TimeRange) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, newRange)
    router.push(`?${params.toString()}`)
  }

  return { range, setRange }
}
