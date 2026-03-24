import * as motion from "motion/react-client"
import { Card, CardContent } from '@/components/ui/card'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import {
  MessageSquare,
  Map,
  FileText,
  Brain,
  Palette,
  Bell,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Feedback Board',
    description:
      'Users submit and upvote feature requests. AI detects duplicates before they are submitted. Your board stays clean automatically.',
  },
  {
    icon: Map,
    title: 'Public Roadmap',
    description:
      'Drag-and-drop kanban with Planned / In Progress / Done. Users see what is coming. Trust builds. Churn reduces.',
  },
  {
    icon: FileText,
    title: 'Changelog',
    description:
      'Publish updates with a notification dot. AI drafts the entry when you ship something. You review and publish in 30 seconds.',
  },
  {
    icon: Brain,
    title: 'AI Product Advisor',
    description:
      "Ask 'what should I build next?' AI reads all your feedback, checks your roadmap, and gives you a specific, reasoned answer.",
  },
  {
    icon: Palette,
    title: 'Widget Builder',
    description:
      'Change colors, position, which tabs show — all from your dashboard. Zero code changes. Updates reflect instantly in your app.',
  },
  {
    icon: Bell,
    title: 'Announcements',
    description:
      'Show banners inside your app without touching your codebase. Control position, colors, dismiss behavior — all from dashboard.',
  },
]

export function FeaturesSection() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Everything you need. Nothing you don't.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          One widget. Full control from your dashboard.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((f, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className="group relative h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:border-teal-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
              {/* Animated bottom gradient line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r from-teal-500 to-emerald-600 transition-all duration-300 group-hover:w-full" />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
