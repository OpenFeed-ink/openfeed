"use client"
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function SectionWrapper({
  children,
  bg = 'white',
}: {
  children: React.ReactNode
  bg?: 'white' | 'dark' | 'light-gray' | 'teal-gradient'
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const bgClasses = {
    white: 'bg-white dark:bg-slate-950',
    dark: 'bg-slate-950 dark:bg-slate-900',
    'light-gray': 'bg-gray-50 dark:bg-slate-900/50',
    'teal-gradient': 'bg-gradient-to-r from-teal-600 to-emerald-600',
  }

  return (
    <div ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 ${bgClasses[bg]}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto"
      >
        {children}
      </motion.div>
    </div>
  )
}
