import * as motion from "motion/react-client"
import { Check, X } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'

const features = [
  { feature: 'Starting price', openfeed: '$15/mo', canny: '$79/mo', frill: '$25/mo', beamer: '$49/mo' },
  { feature: 'User limits', openfeed: 'Unlimited', canny: 'Pay more to grow', frill: 'Limited', beamer: 'Limited' },
  { feature: 'Open source', openfeed: true, canny: false, frill: false, beamer: false },
  { feature: 'Self-hostable', openfeed: '✅ Free', canny: '❌', frill: '❌', beamer: '❌' },
  { feature: 'Forced branding', openfeed: 'Never', canny: 'On lower plans', frill: 'On lower plans', beamer: 'On lower plans' },
  { feature: 'AI features', openfeed: '✅ Included', canny: 'Credits extra', frill: '❌ None', beamer: '❌ None' },
  { feature: 'Widget customization', openfeed: 'From dashboard', canny: 'Limited', frill: 'Limited', beamer: 'Limited' },
  { feature: 'AI Product Advisor', openfeed: '✅', canny: '❌', frill: '❌', beamer: '❌' },
  { feature: 'Announcement widget', openfeed: '✅', canny: '❌', frill: '❌', beamer: '✅' },
  { feature: 'Per-credit AI fees', openfeed: 'Never', canny: '$0.10/credit', frill: 'N/A', beamer: 'N/A' },
]

export function ComparisonTable() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12">How OpenFeed compares</h2>
      <div className="overflow-x-auto">
        <motion.table
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="min-w-full border-collapse"
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-4 px-4 font-semibold">Feature</th>
              <th className="text-left py-4 px-4 font-semibold bg-teal-50 dark:bg-teal-950/30 rounded-tl-lg text-teal-800 dark:text-teal-300">OpenFeed</th>
              <th className="text-left py-4 px-4 font-semibold">Canny</th>
              <th className="text-left py-4 px-4 font-semibold">Frill</th>
              <th className="text-left py-4 px-4 font-semibold">Beamer</th>
             </tr>
          </thead>
          <tbody>
            {features.map((row, i) => (
              <motion.tr
                key={i}
                variants={fadeInUp}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                <td className="py-3 px-4 font-medium">{row.feature}</td>
                <td className="py-3 px-4 bg-teal-50 dark:bg-teal-950/30">
                  {typeof row.openfeed === 'boolean' ? (
                    row.openfeed ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />
                  ) : (
                    row.openfeed
                  )}
                </td>
                <td className="py-3 px-4">
                  {typeof row.canny === 'boolean' ? (
                    row.canny ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />
                  ) : (
                    row.canny
                  )}
                </td>
                <td className="py-3 px-4">
                  {typeof row.frill === 'boolean' ? (
                    row.frill ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />
                  ) : (
                    row.frill
                  )}
                </td>
                <td className="py-3 px-4">
                  {typeof row.beamer === 'boolean' ? (
                    row.beamer ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-400" />
                  ) : (
                    row.beamer
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        *Canny pricing based on 1,000 tracked users on Core plan. Frill pricing based on Startup plan. Updated March 2026.
      </p>
    </div>
  )
}
