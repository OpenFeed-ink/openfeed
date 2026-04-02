import { Card, CardContent } from '@/components/ui/card'
import * as motion from "motion/react-client"
import { Check } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { PayBtn } from '@/components/PayBtn/PayBtn'

const plans = [
  {
    name: 'Starter' as "Starter" | "Growth" | "Scale",
    price: '$15',
    period: '/month',
    description: 'Perfect for small teams.',
    features: [
      '1 project',
      '5 team members',
      'All features included',
      'Unlimited end users',
      'AI Product Advisor',
      'Email support',
      '7-day free trial',
    ],
    cta: 'Start free trial →',
    popular: true,
  },
  {
    name: 'Growth' as "Starter" | "Growth" | "Scale",
    price: '$29',
    period: '/month',
    description: 'For growing companies.',
    features: [
      '5 projects',
      '15 team members',
      'Everything in Starter',
      'API access (soon)',
      'Priority support',
    ],
    cta: 'Start free trial →',
    popular: false,
  },
  {
    name: 'Scale' as "Starter" | "Growth" | "Scale",
    price: '$59',
    period: '/month',
    description: 'For large organizations.',
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Everything in Growth',
      'Custom domain (soon)',
      'Webhooks (soon)',
      '24h support SLA',
    ],
    cta: 'Start free trial →',
    popular: false,
  },
]

export function PricingSection() {

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-4">Honest pricing. No surprises.</h2>
      <p className="text-lg text-gray-500 text-center mb-12">
        Flat monthly fee. Unlimited users. All features on every plan.
      </p>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Card className={`h-full relative ${plan.popular ? 'border-teal-500 shadow-lg' : ''}`}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <PayBtn plan={plan} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          All plans include a 7-day free trial. No credit card required to start. Cancel anytime — no questions asked, no email support required.
        </p>
        <p className="text-sm text-teal-600 mt-2">🔒 We will never charge per tracked user. Pricing is flat no matter how many users your product has.</p>
      </div>
    </div>
  )
}
