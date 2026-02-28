import * as motion from "motion/react-client"
import { CheckCircle2, Code, CreditCard, Lock, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Flat $19/month",
    description: "No per-user pricing. Ever. Pay one price regardless of your growth.",
  },
  {
    icon: Lock,
    title: "No forced branding",
    description: "Your product stays yours. No 'Powered by' badges, even on free.",
  },
  {
    icon: Code,
    title: "Open source",
    description: "Self-host free with one Docker command. Full control, no lock-in.",
  },
  {
    icon: Users,
    title: "No user tracking",
    description: "We don't track your end users. Privacy first, always.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function MarketingInfo() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col justify-center items-center space-y-8 p-8 lg:p-12"
    >
      {/* Headline */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Open source feedback, roadmap & changelog
        </h2>
        <p className="text-lg text-muted-foreground">
          Install once. Control everything from your dashboard. Never touch code again.
        </p>
      </motion.div>

      {/* One-line install highlight */}
      <motion.div
        variants={itemVariants}
        className="rounded-lg bg-teal-50 p-4 dark:bg-teal-950/30"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 shrink-0 text-teal-600 dark:text-teal-400" />
          <p className="text-md sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            One script tag. Everything from dashboard. Feature requests, roadmap, and changelog
            that update instantly without any code changes.
          </p>
        </div>
      </motion.div>

      {/* Feature list */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Why teams switch to OpenFeed
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-3">
                <Icon className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="font-medium text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Trust indicator */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-teal-600" />
        <span>Trusted by 500+ early-stage SaaS teams</span>
      </motion.div>
    </motion.div>
  );
}
