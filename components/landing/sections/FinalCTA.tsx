import { Button } from '@/components/ui/button'
import * as motion from "motion/react-client"
import { fadeInUp } from '@/lib/animations'
import Link from "next/link"

export function FinalCTA() {
  return (
    <div className="text-center">
      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
      >
        Stop paying Canny to listen to your users.
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
      >
        Join the teams that switched to OpenFeed. Flat pricing. No user limits. Open source.
      </motion.p>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
          <Link href={"/signup"}>
            Start your 7-day free trial →
          </Link>

        </Button>
        <Button asChild size="lg" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950">
          <Link href={"https://github.com/OpenFeed-ink/openfeed"}>
            Self-host free on GitHub
          </Link>
        </Button>
      </motion.div>
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-sm text-muted-foreground mt-6"
      >
        No credit card required · Cancel anytime · MIT licensed
      </motion.p>
    </div>
  )
}
