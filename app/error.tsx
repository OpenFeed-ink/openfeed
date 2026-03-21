'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-500 shadow-xl">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Something went wrong!</h2>
        <p className="mb-6 text-muted-foreground">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <Button onClick={reset} size={'lg'}>
          Try again
        </Button>
      </div>
    </div>
  )
}
