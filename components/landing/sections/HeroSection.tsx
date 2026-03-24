import * as motion from "motion/react-client"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { PubFeatureCard } from "@/components/Pub/PubFeatureCard"
import { ChangelogList } from "@/components/ChangelogList/ChangelogList"
import { statusColors, statusLabels } from "@/type"
import Link from "next/link"
const features = [
  {
    id: "feat_1",
    createdAt: new Date("2026-03-01"),
    title: "AI-powered feedback summarization",
    description: "Automatically group and summarize similar feedback using AI to reduce noise.",
    status: "under_review" as const,
    upvotesCount: 64,
    comments: [{ id: "c1" }, { id: "c2" }],
    tags: [
      {
        tag: {
          id: "t1",
          name: "AI",
          createdAt: new Date(),
          projectId: "demo",
          color: "#8B5CF6"
        }
      }
    ]
  },
  {
    id: "feat_2",
    createdAt: new Date("2026-02-20"),
    title: "Custom domain for public roadmap",
    description: "Allow teams to host roadmap on their own domain.",
    status: "planned" as const,
    upvotesCount: 112,
    comments: [{ id: "c3" }],
    tags: [
      {
        tag: {
          id: "t2",
          name: "Customization",
          createdAt: new Date(),
          projectId: "demo",
          color: "#F59E0B"
        }
      }
    ]
  },
  {
    id: "feat_3",
    createdAt: new Date("2026-02-10"),
    title: "Realtime updates without refresh",
    description: "Board updates instantly when features change.",
    status: "in_progress" as const,
    upvotesCount: 148,
    comments: [{ id: "c4" }, { id: "c5" }, { id: "c6" }],
    tags: [
      {
        tag: {
          id: "t3",
          name: "Realtime",
          createdAt: new Date(),
          projectId: "demo",
          color: "#10B981"
        }
      }
    ]
  },
  {
    id: "feat_4",
    createdAt: new Date("2026-01-25"),
    title: "Embeddable roadmap widget",
    description: "Embed roadmap into any website.",
    status: "done" as const,
    upvotesCount: 89,
    comments: [{ id: "c7" }],
    tags: []
  },
  {
    id: "feat_5",
    createdAt: new Date("2026-01-15"),
    title: "Upvote spam protection",
    description: "Prevent abuse with rate limiting and fingerprinting.",
    status: "closed" as const,
    upvotesCount: 23,
    comments: [{ id: "c8" }],
    tags: []
  },
  {
    id: "feat_6",
    createdAt: new Date("2026-03-05"),
    title: "Slack integration for new feedback",
    description: "Send notifications to Slack channels.",
    status: "planned" as const,
    upvotesCount: 76,
    comments: [],
    tags: []
  },
  {
    id: "feat_7",
    createdAt: new Date("2026-02-28"),
    title: "Advanced filtering by tags",
    description: "Filter features by multiple tags.",
    status: "under_review" as const,
    upvotesCount: 51,
    comments: [],
    tags: []
  },
  {
    id: "feat_8",
    createdAt: new Date("2026-02-05"),
    title: "Performance improvements for large boards",
    description: "Optimized rendering for 1000+ features.",
    status: "in_progress" as const,
    upvotesCount: 134,
    comments: [{ id: "c9" }],
    tags: []
  }
];


const changelog1 = {
  id: "chg_4h2k9x",
  createdAt: new Date("2026-03-10T09:30:00Z"),
  title: "Embeddable public roadmap widget is live",
  content: `
    <h2>🚀 Public roadmap widget is now available</h2>
    <p>
      You can now share your roadmap publicly with a simple embeddable widget.
      This allows your users to stay updated on what you're building — directly from your website.
    </p>

    <h3>✨ What you can do</h3>
    <ul>
      <li>Embed your roadmap on any website using a single script</li>
      <li>Display features by status (Planned, In Progress, Done)</li>
      <li>Reflect updates instantly without requiring a page refresh</li>
      <li>Keep your users aligned with your product direction</li>
    </ul>

    <h3>⚡ Why this matters</h3>
    <p>
      Transparency builds trust. By sharing your roadmap publicly, your users can
      see what’s coming next and understand your priorities.
    </p>

    <p>
      This has been one of the most requested features — and we’re excited to finally ship it.
    </p>

    <h3>🛠️ How to get started</h3>
    <p>
      Head over to your dashboard, copy the embed code, and paste it into your website.
      Your roadmap will be live in seconds.
    </p>
  `,
  category: "new_feature" as const,
  projectId: "proj_123",
  user: {
    id: "user_1",
    name: "Ali Amer",
    image: null,
    usersProjects: [
      {
        role: "ADMIN" as const
      }
    ]
  }
};

type FeatureStatus =
  | "under_review"
  | "planned"
  | "in_progress"
  | "done"
  | "closed";

const statuses = [
  { value: "under_review", label: statusLabels["under_review"], color: statusColors["under_review"] },
  { value: "planned", label: statusLabels["planned"], color: statusColors["planned"] },
  { value: "in_progress", label: statusLabels["in_progress"], color: statusColors["in_progress"] },
  { value: "done", label: statusLabels["done"], color: statusColors["done"] },
  { value: "closed", label: statusLabels["closed"], color: statusColors["closed"] },
];

const featuresByStatus = features.reduce<Record<FeatureStatus, typeof features>>(
  (acc, current) => {
    acc[current.status].push(current);
    return acc;
  },
  {
    under_review: [],
    planned: [],
    in_progress: [],
    done: [],
    closed: [],
  }
);

export function HeroSection() {
  return (
    <div className="relative bg-slate-950 text-white overflow-hidden w-full">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15)_0%,rgba(0,0,0,0)_70%)]` pointer-events-none" />

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={fadeInUp} className="flex justify-center gap-3 mb-8">
            <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-transparent">
              ✦ Open Source
            </Badge>
            <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-transparent">
              ★ Star us on GitHub
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Your users have feedback.
            <br />
            <span className="bg-linear-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Stop paying Canny to hear it.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-10"
          >
            OpenFeed is the open source alternative to Canny and Frill.
            Collect feedback, manage your roadmap, publish changelogs — all through one embeddable widget.
            Flat $15/month. No user limits. No forced branding.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-lg">
              <Link href={"/signup"}>
                Start 7-day free trial →
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/20 text-white hover:bg-white/10 rounded-lg"
            >
              <Link href={"https://github.com/OpenFeed-ink/openfeed"}>
                Self-host free
              </Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-sm text-gray-400">
            No credit card required · Cancel anytime
          </motion.p>
        </motion.div>

        {/* Animated mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <div className="relative mx-auto max-w-4xl animate-float">
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <Tabs defaultValue="feedback" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-slate-800">
                    <TabsTrigger value="feedback" className="data-[state=active]:bg-emerald-600">Feedback</TabsTrigger>
                    <TabsTrigger value="changelog" className="data-[state=active]:bg-emerald-600">Changelog</TabsTrigger>
                    <TabsTrigger value="roadmap" className="data-[state=active]:bg-emerald-600">Roadmap</TabsTrigger>
                  </TabsList>
                  <TabsContent value="feedback" className="mt-4 space-y-3">
                    {features.slice(0, 4).map((f) => (
                      <PubFeatureCard key={f.id} feature={f} />
                    ))}
                  </TabsContent>
                  <TabsContent value="changelog" className="mt-4">
                    <ChangelogList entries={[changelog1]} userId="" keepOpen />
                  </TabsContent>
                  <TabsContent value="roadmap" className="mt-4">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {statuses.map((status) => (
                        <div key={status.value} className="w-72 shrink-0 bg-muted/30 rounded-lg p-3">
                          <div className="flex justify-between mb-3">
                            <h3 className={`text-sm font-medium px-2 py-1 rounded ${status.color}`}>
                              {status.label}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {featuresByStatus[status.value as FeatureStatus].length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {featuresByStatus[status.value as FeatureStatus].map((feature) => (
                              <PubFeatureCard key={feature.id} feature={feature} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="absolute -inset-4 bg-teal-500/20 blur-3xl rounded-full -z-10" />
          </div>
        </motion.div>

        {/* Social proof numbers */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-8 mt-20 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">🌟 Open Source</div>
          <div className="hidden sm:block text-gray-600">·</div>
          <div className="flex items-center gap-2">📦 npm install @openfeed/widget</div>
          <div className="hidden sm:block text-gray-600">·</div>
          <div className="flex items-center gap-2">🐳 Docker in 1 command</div>
          <div className="hidden sm:block text-gray-600">·</div>
          <div className="flex items-center gap-2">💳 No per-user fees</div>
        </motion.div>
      </div>
    </div>
  )
}
