import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 shadow-xl">
              <FileQuestion className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Page not found</h2>
        <p className="mb-6 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size={'lg'} >
          <Link href="/projects">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
