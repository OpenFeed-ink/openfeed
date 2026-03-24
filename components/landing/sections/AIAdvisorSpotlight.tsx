'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'

const fullResponse = `Based on your feedback data, I'd recommend prioritizing API webhooks next. Here's why:

• API Webhooks has 38 upvotes — your #2 most requested feature. Users are specifically asking for Zapier integration.

• Dark mode (your #1 by votes) is already planned on your roadmap — covered.

• CSV Export has 31 upvotes and is probably a 2-3 day build based on scope.

My recommendation: ship webhooks this sprint, schedule CSV export for next week.`

export function AIAdvisorSpotlight() {
  const [displayText, setDisplayText] = useState('')
  const [index, setIndex] = useState(0)
  const [typingComplete, setTypingComplete] = useState(false)

  useEffect(() => {
    if (index < fullResponse.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullResponse[index])
        setIndex(prev => prev + 1)
      }, 20)
      return () => clearTimeout(timeout)
    } else {
      setTypingComplete(true)
    }
  }, [index])

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm mb-4">
          AI-Powered
        </motion.div>
        <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white mb-4">
          Meet your AI Product Advisor
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-gray-300 mb-6">
          The first feedback tool with an AI that actually understands your product.
        </motion.p>
        <motion.ul variants={staggerContainer} className="space-y-3">
          {[
            'Reads all your feedback before answering',
            'Checks your roadmap to avoid duplicate work',
            'Gives specific recommendations, not generic advice',
            'Understands YOUR product, not just generic SaaS',
          ].map((item, i) => (
            <motion.li key={i} variants={fadeInUp} className="flex items-center gap-2 text-gray-200">
              <Check className="h-4 w-4 text-teal-400" />
              {item}
            </motion.li>
          ))}
        </motion.ul>
        <motion.p variants={fadeInUp} className="mt-6 text-teal-300 text-sm">
          No extra credits. No AI tier. Included in every paid plan.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="bg-slate-800/50 border-white/10 p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">U</div>
              <div className="flex-1">
                <p className="font-medium">You</p>
                <p className="text-gray-300 mt-1">What should I build next?</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">AI</div>
              <div className="flex-1">
                <p className="font-medium">AI Product Advisor</p>
                <div className="text-gray-300 mt-1 whitespace-pre-line">
                  {displayText}
                  {!typingComplete && <span className="animate-pulse">|</span>}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
