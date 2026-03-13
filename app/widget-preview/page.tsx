
export default async function WidgetPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ config?: string }>
}) {
  const param = await searchParams

  const config = param.config ? JSON.parse(decodeURIComponent(param.config)) : null

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Navigation */}
        <nav className="border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">OpenFeed</div>
              <div className="space-x-6">
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-teal-600">Features</a>
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-teal-600">Pricing</a>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Collect feedback your users
              <span className="block text-teal-600 dark:text-teal-400">actually want to give</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              OpenFeed is the open-source feedback, roadmap, and changelog platform.
              One script tag, infinite control — all from your dashboard.
            </p>
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors">
              Start Free Trial
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Feature Requests",
                desc: "Let users submit and upvote ideas. Built-in duplicate detection.",
                icon: "💡"
              },
              {
                title: "Public Roadmap",
                desc: "Share your plans with a beautiful kanban board. Drag and drop.",
                icon: "🗺️"
              },
              {
                title: "Changelog",
                desc: "Announce updates with rich formatting. Multiple display modes.",
                icon: "📝"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} OpenFeed. Open source feedback tool.
          </div>
        </footer>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
                window.__OPENFEED_PREVIEW_CONFIG = ${JSON.stringify(config)};
              `,
        }}
      />
      <script async src="/packages/widget.iife.js" data-project-id={config.projectId} data-api-url={process.env.BETTER_AUTH_URL || "http://localhost:3000"}></script>
    </>
  )
}
