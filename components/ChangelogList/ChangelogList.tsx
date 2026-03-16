import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { categoryConfig } from '@/type'
import { UpsertChangelog } from '../UpsertChangelog/UpsertChangelog'
import { changelogs } from '@/db/schema'


export function ChangelogList({ entries }: { entries: typeof changelogs.$inferSelect[] }) {

  return entries.length === 0 ? (
    <Card className="p-12 text-center">
      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No changelog entries yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Create your first changelog entry to keep users updated.
      </p>
    </Card>
  ) : (
    /* Entries List as Accordion */
    <Accordion type="multiple" className="space-y-4">
      {entries.map((entry) => {
        const config = categoryConfig[entry.category as keyof typeof categoryConfig] || categoryConfig.new_feature
        const Icon = config.icon
        const date = new Date(entry.createdAt!)

        return (
          <AccordionItem
            key={entry.id}
            value={entry.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <div className="relative">
              <AccordionTrigger className="w-full px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors text-left">

                <div className="flex items-center justify-between w-full gap-4 pr-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>

                    <span className="font-semibold truncate">
                      {entry.title}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(date, { addSuffix: true })}
                  </span>
                </div>

              </AccordionTrigger>
              {/* Edit Button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <UpsertChangelog editingEntry={entry} projectId={entry.projectId} />
              </div>
            </div>

            <AccordionContent className="px-6 pb-6 pt-2 max-h-[75vh] overflow-auto">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </AccordionContent>
          </AccordionItem>)
      })}
    </Accordion>
  )
}
