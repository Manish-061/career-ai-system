import React from "react"

const parseInlineStyles = (text) => {
  if (!text) return null
  
  // A simple regex approach to handle **bold** and *italic*
  // We'll split the text by strong indicators and wrap in elements.
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="text-slate-700 italic">{part.slice(1, -1)}</em>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em] text-cyan-800 font-mono">{part.slice(1, -1)}</code>
    }
    return <span key={index}>{part}</span>
  })
}

export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null

  // Split content by double newlines into blocks
  const blocks = content.split(/\n{2,}/)

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, blockIndex) => {
        // Handle Headings
        if (block.startsWith("### ")) {
          return (
            <h4 key={blockIndex} className="text-lg font-semibold text-slate-800 mt-4 mb-2">
              {parseInlineStyles(block.replace(/^###\s+/, ""))}
            </h4>
          )
        }
        if (block.startsWith("## ")) {
          return (
            <h3 key={blockIndex} className="text-xl font-bold text-slate-900 mt-5 mb-3">
              {parseInlineStyles(block.replace(/^##\s+/, ""))}
            </h3>
          )
        }
        if (block.startsWith("# ")) {
          return (
            <h2 key={blockIndex} className="text-2xl font-bold text-slate-900 mt-6 mb-4">
              {parseInlineStyles(block.replace(/^#\s+/, ""))}
            </h2>
          )
        }

        // Handle Bulleted Lists
        const isList = block.split("\n").every(line => line.trim().startsWith("* ") || line.trim().startsWith("- ") || line.trim() === "")
        if (isList) {
          const items = block.split("\n").filter(Boolean)
          return (
            <ul key={blockIndex} className="list-disc pl-5 space-y-1.5 text-slate-600">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="leading-7">
                  {parseInlineStyles(item.replace(/^[\*\-]\s+/, ""))}
                </li>
              ))}
            </ul>
          )
        }

        // Handle Numbered Lists
        const isNumberedList = block.split("\n").every(line => /^\d+\.\s+/.test(line.trim()) || line.trim() === "")
        if (isNumberedList) {
          const items = block.split("\n").filter(Boolean)
          return (
            <ol key={blockIndex} className="list-decimal pl-5 space-y-1.5 text-slate-600">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="leading-7">
                  {parseInlineStyles(item.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          )
        }

        // Default Paragraph Handling (might contain single newlines)
        const lines = block.split("\n")
        return (
          <p key={blockIndex} className="text-slate-600 leading-7">
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {parseInlineStyles(line)}
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
