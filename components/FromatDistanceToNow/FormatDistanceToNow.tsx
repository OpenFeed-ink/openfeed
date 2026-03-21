"use client"

import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"

export const FormatDistanceToNow = ({ createdAt }: { createdAt: Date }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return (
    <span>
      {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
    </span>
  )
}
