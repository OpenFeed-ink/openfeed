import * as motion from "motion/react-client"
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Database, Lock, Mail } from 'lucide-react'
import Link from "next/link"

export default function LegalContent() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-border/50 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Legal</h1>
              <p className="text-muted-foreground">
                Terms of Service & Privacy Policy · Last updated March 2026
              </p>
              <Separator className="my-4" />
            </div>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to OpenFeed, an open-source feedback, roadmap, and changelog platform.
                By using OpenFeed Cloud, you agree to these Terms. If you do not agree, please do not use the Service.
              </p>
            </section>

            <Separator />

            {/* Terms of Service */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-6">2. Terms of Service</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    2.1 Acceptable Use
                  </h3>
                  <p className="text-muted-foreground">You agree to:</p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Use the service only for lawful purposes</li>
                    <li>Not abuse, overload, or disrupt the platform</li>
                    <li>Not attempt unauthorized access</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    We may suspend or terminate accounts that violate these terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">2.2 Accounts</h3>
                  <p className="text-muted-foreground">
                    You are responsible for keeping your account credentials secure and all activity under your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">2.3 Subscriptions & Billing</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Payments are processed by Paddle</li>
                    <li>Subscriptions renew automatically unless canceled</li>
                    <li>You can cancel anytime from your dashboard</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">2.4 Service Availability</h3>
                  <p className="text-muted-foreground">
                    We aim for high availability but do not guarantee uninterrupted service. Downtime may occur due to maintenance or unexpected issues.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">2.5 Liability Disclaimer</h3>
                  <p className="text-muted-foreground">
                    The service is provided "as is". We are not responsible for data loss, inaccuracies, or damages resulting from use of the Service.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-6">3. Privacy Policy</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
                    <Database className="h-5 w-5 text-teal-600" />
                    3.1 Data We Collect
                  </h3>
                  <p className="text-muted-foreground">We collect only what is necessary:</p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Account data (name, email)</li>
                    <li>Project data (feedback, roadmap, changelog content)</li>
                    <li>Usage data (basic analytics, API usage)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">3.2 Data We Do NOT Store or Sell</h3>
                  <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded-lg">
                    <p className="text-teal-800 dark:text-teal-200 font-medium">We do:</p>
                    <ul className="list-disc list-inside text-teal-700 dark:text-teal-300 mt-1">
                      <li>NOT sell your data</li>
                      <li>NOT use your data to train AI models</li>
                    </ul>
                    <p className="mt-2 text-muted-foreground">We only process your data to provide the Service.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">3.3 End User Data (Widgets)</h3>
                  <p className="text-muted-foreground">
                    We offer a 7-day free trial so you can fully evaluate the service before making a purchase.
                    After the trial period, payments are processed for continued access to the platform.
                    If you experience any issues, please contact support and we will do our best to assist you.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">3.4 Payments</h3>
                  <p className="text-muted-foreground">
                    Payments are handled securely by Paddle. We do not store your payment details.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-teal-600" />
                    3.5 Security
                  </h3>
                  <p className="text-muted-foreground">
                    We use industry-standard protections: HTTPS encryption, secure authentication, access control and monitoring.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">3.6 Data Retention</h3>
                  <p className="text-muted-foreground">
                    Data is kept while your account is active and deleted within 30 days after account deletion.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">3.7 Your Rights</h3>
                  <p className="text-muted-foreground">
                    You can access or export your data, request deletion, or contact us for any privacy request.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Refund Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-3">4. Refund Policy</h2>
              <p className="text-muted-foreground">
                We offer a 7-day free trial so you can fully evaluate the service before making a purchase.
                After the trial period, payments are processed for continued access to the platform.
                If you experience any issues, please contact support and we will do our best to assist you.
              </p>
            </section>

            <Separator />

            {/* Changes & Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-3">5. Changes to These Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. Continued use means you accept the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                6. Contact
              </h2>
              <p className="text-muted-foreground">
                Email: aliamer19ali@gmail.com<br />
                Website: <Link href="/" className="text-teal-600 hover:underline">openfeed.ink</Link>
              </p>
            </section>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
              © {new Date().getFullYear()} OpenFeed. All rights reserved.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
