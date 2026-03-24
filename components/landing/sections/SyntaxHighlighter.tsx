'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighterPrism } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SyntaxHighlighterProps {
  language: string
  code: string
}

export function SyntaxHighlighter({ language, code }: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className= "relative group" >
    <button
        onClick={ copyToClipboard }
  className = "absolute right-2 top-2 z-10 p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
    >
    { copied?<Check className = "h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
</button>
  < SyntaxHighlighterPrism
language = { language }
style = { vscDarkPlus }
customStyle = {{
  margin: 0,
    borderRadius: '0.5rem',
      padding: '1rem',
        fontSize: '0.875rem',
        }}
      >
  { code }
  </SyntaxHighlighterPrism>
  </div>
  )
}
