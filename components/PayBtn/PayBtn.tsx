"use client"
import { Button } from '@/components/ui/button'
import { usePay } from '@/contexts/PaymentContext'

export const PayBtn = ({ plan }: { plan: { popular: boolean, name: "Starter" | "Growth" | "Scale", cta: string } }) => {
  const { paddlePay } = usePay()
  return (
    <Button
      className={`mt-6 w-full ${plan.popular ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
      variant={plan.popular ? 'default' : 'outline'}
      onClick={() => paddlePay(plan.name)}
    >
      {plan.cta}
    </Button>
  )
}
