import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Is OpenFeed really free to self-host?',
    a: 'Yes. The entire codebase is MIT licensed. Clone the repo, run docker-compose up, and you have a fully working instance. No license keys, no feature limits, no expiry.',
  },
  {
    q: 'What happens if I hit my project limit?',
    a: 'Upgrade to the next plan. Your data stays exactly where it is. We don’t delete or restrict access when you’re near a limit.',
  },
  {
    q: 'How is pricing different from Canny?',
    a: 'Canny charges based on how many users interact with their widget (tracked users). At 1,000 users you pay $275/month. OpenFeed charges a flat fee regardless of how many end users your product has. Your growth doesn’t increase your bill.',
  },
  {
    q: 'Can I remove OpenFeed branding?',
    a: 'Yes, on every paid plan including Starter at $15/month. We never require you to display our logo on your product.',
  },
  {
    q: 'What AI model does OpenFeed use?',
    a: 'GPT-4o-mini for all AI features. Fast, accurate, and cost-efficient. All AI features are included in your flat monthly fee — we don’t charge per AI credit or per query.',
  },
  {
    q: 'Can I migrate my data from Canny or Frill?',
    a: "We're building a migration tool. For now, contact support and we'll help you migrate manually.",
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel anytime from your billing settings — no email required, no questions asked. Your data remains accessible for 30 days after cancellation.',
  },
]

export function FAQSection() {
  return (
    <div>
      <h2 className="text-4xl font-bold text-center mb-12">Common questions</h2>
      <div className="max-w-5xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium text-2xl cursor-pointer">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-500 text-xl">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
