import * as motion from "motion/react-client"
import { Code, Palette, Rocket } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'

const steps = [
  {
    icon: Code,
    title: 'Install the widget (30 seconds)',
    description:
      "Add one script tag to your app's head. Or npm install for React. That's the last time you touch code for this.",
  },
  {
    icon: Palette,
    title: 'Customize from your dashboard (2 minutes)',
    description:
      'Pick your colors, choose which tabs to show, set the button position. Preview updates live. Click save. Done.',
  },
  {
    icon: Rocket,
    title: 'Collect feedback, ship with confidence (ongoing)',
    description:
      'Users submit ideas, upvote features, check your roadmap. Your AI Advisor tells you what to build next. You ship the right things.',
  },
]

export function HowItWorks() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12">From install to first insight in 5 minutes</h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-8 relative"
      >
        {/* Connecting lines (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gray-200 dark:bg-gray-800 -translate-y-1/2" />
        {steps.map((step, i) => (
          <motion.div key={i} variants={fadeInUp} className="relative text-center">
            <div className="relative z-10 bg-white dark:bg-gray-950 w-16 h-16 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <step.icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gray-200 dark:bg-gray-800" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
