const formatScore = (score) => Number(score ?? 0).toFixed(2)

const getExplanationPoints = (explanation) =>
  explanation
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}.`)

export default function ExplanationSection({ data, aiAssistance }) {
  const explanationPoints = getExplanationPoints(data.explanation)

  return (
    <article
      id="recommendation-explanation"
      className="result-card animate-fade-in-up delay-1 scroll-mt-32"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="section-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Explanation
        </span>
        <span className="text-sm font-semibold tabular-nums text-slate-500">
          Score {formatScore(data.score)}
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5">
        <p className="text-base font-semibold text-slate-900">
          Reason for Recommendation: {data.role}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {explanationPoints.map((point, i) => (
          <div
            key={point}
            className={`flex gap-3 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md animate-fade-in-up delay-${Math.min(i + 2, 8)}`}
          >
            <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            <p className="text-sm leading-7 text-slate-600">{point}</p>
          </div>
        ))}
      </div>

      {aiAssistance ? (
        <div className="mt-5 rounded-[22px] border border-cyan-200 bg-cyan-50/70 p-5 animate-fade-in delay-4">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
              </svg>
              AI Guidance Summary
            </span>
            <span className="text-sm font-semibold tabular-nums text-cyan-900">
              Confidence {formatScore(aiAssistance.parse_confidence)}
            </span>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {aiAssistance.summary}
          </p>
        </div>
      ) : null}
    </article>
  )
}
