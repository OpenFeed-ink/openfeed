import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Sparkles } from "lucide-react"
import { categoryConfig } from "@/type"
import { ChangelogActions } from "../ChangelogActions/ChangelogActions"
import { FormatDistanceToNow } from "../FromatDistanceToNow/FormatDistanceToNow"

export type ChangelogEntry = {
  id: string
  createdAt: Date
  title: string
  content: string
  category: "new_feature" | "improvement" | "bug_fix"
  projectId: string
  user: {
    id: string
    name: string
    image: string | null
    usersProjects: {
      role: "ADMIN" | "MEMBER"
    }[]
  } | null
}

interface ChangelogListProps {
  entries: ChangelogEntry[],
  userId: string,
}

export function ChangelogList({ entries, userId }: ChangelogListProps) {
  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No changelog entries yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Create your first changelog entry to keep users updated.
        </p>
      </Card>
    )
  }

  return (
    <Accordion type="multiple" className="space-y-4">
      {entries.map((entry) => {
        const config = categoryConfig[entry.category] || categoryConfig.new_feature
        const Icon = config.icon
        const user = entry.user
        const userRole = user?.usersProjects?.[0]?.role

        return (
          <AccordionItem
            key={entry.id}
            value={entry.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <div className="relative">
              <AccordionTrigger className="w-full px-2 py-2 pr-12 hover:no-underline hover:bg-muted/50 transition-colors text-left">
                <div className="flex flex-col items-start gap-2 w-full">
                  <Badge className={config.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  <span className="font-semibold sm:text-xl wrap-break-word w-full">{entry.title}</span>
                </div>
              </AccordionTrigger>
              {/* Edit Button */}
              <ChangelogActions
                entry={entry}
                userId={userId}
              />
            </div>

            <AccordionContent className="px-4 pb-6 pt-2 max-h-[75vh] overflow-auto">
              {/* Author and date info */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                {user ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                    {userRole && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {userRole.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Anonymous</span>
                )}
                <time className="text-xs text-muted-foreground" dateTime={entry.createdAt.toString()}>
                  <FormatDistanceToNow createdAt={entry.createdAt}/>
                </time>
              
              </div>

              {/* Changelog content */}
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
