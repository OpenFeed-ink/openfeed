'use client'

import { useState } from 'react'
import { SyntaxHighlighter } from './SyntaxHighlighter'
import Image from "next/image"

const scriptCode = `<script 
  async 
  src="https://cdn.openfeed.ink/widget/v1/widget.iife.js" 
  data-project-id="your-project-id">
</script>`

const npmCode = `npm install @openfeed/widget

import { OpenFeed } from '@openfeed/widget'

<OpenFeed projectId="your-slug" />`

export function InstallSection() {
  const [activeTab, setActiveTab] = useState<'script' | 'npm'>('script')

  return (
    <div className="bg-slate-950 dark:bg-slate-950 text-white rounded-2xl p-8 md:p-12 shadow-xl">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left: Large image – takes 2 columns */}
        <div className="md:col-span-2 relative order-2 md:order-1">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse -z-10" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="relative w-full p-4">
              <Image
                src="/widget-builder.png"
                alt="Widget Builder Dashboard"
                width={1000}
                height={700}
                className="w-full h-auto object-contain rounded-lg"
                priority
                quality={100}
              />
            </div>
          </div>
        </div>

        {/* Right: Code blocks */}
        <div className="order-1 md:order-2">
          <h3 className="text-3xl font-bold mb-2">Install in 30 seconds</h3>
          <p className="text-gray-300 mb-6">Never touch it again. All customization from your dashboard.</p>
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'script' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Script tag
              </button>
              <button
                onClick={() => setActiveTab('npm')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'npm' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                npm / React
              </button>
            </div>
            <div className="relative">
              {activeTab === 'script' && (
                <SyntaxHighlighter language="html" code={scriptCode} />
              )}
              {activeTab === 'npm' && (
                <SyntaxHighlighter language="bash" code={npmCode} />
              )}
              <p className="text-xs text-gray-400 mt-3">
                That's it. Change colors, enable tabs, update branding — all from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
