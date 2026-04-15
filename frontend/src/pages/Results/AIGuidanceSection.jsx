const formatScore = (score) => Number(score ?? 0).toFixed(2)

export default function AIGuidanceSection({ aiAssistance }) {
  if (!aiAssistance) return null

  return (
    <article
      id="recommendation-ai-guidance"
      className="result-card xl:col-span-2 animate-fade-in-up delay-3 scroll-mt-32"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="section-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 6v6l4 2" />
          </svg>
          AI Guidance Summary
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-cyan-100 bg-cyan-50/40 p-5">
        <p className="text-sm leading-7 text-slate-600">
          {aiAssistance.summary}
        </p>
      </div>
    </article>
  )
}
