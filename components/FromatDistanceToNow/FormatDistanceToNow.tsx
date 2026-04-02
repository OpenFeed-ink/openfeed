"use client"

import { formatDistanceToNow } from "date-fns"

export const FormatDistanceToNow = ({ createdAt }: { createdAt: Date }) => {
  return (
    <span>
      {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
    </span>
  )
}
