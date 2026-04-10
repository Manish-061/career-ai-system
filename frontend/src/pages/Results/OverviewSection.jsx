import { useState } from "react"
import Badge from "../../components/ui/Badge"
import AnimatedCounter from "../../components/ui/AnimatedCounter"

const getScoreStatus = (score) => {
  if (score >= 0.75) return { label: "Strong Match", variant: "success" }
  if (score >= 0.5) return { label: "Promising Fit", variant: "warning" }
  return { label: "Growth Opportunity", variant: "danger" }
}

const formatScore = (score) => Number(score ?? 0).toFixed(2)

export default function OverviewSection({ data, profile, aiAssistance, aiWarning }) {
  const scoreStatus = getScoreStatus(data.score)
  const alignedInterests = data.matched_interests?.length
    ? data.matched_interests
    : profile?.interests || []
  const assistanceLabel =
    aiAssistance?.model === "heuristic-parser"
      ? "Backup Parser Assisted"
      : aiAssistance
        ? "AI Assisted"
        : null

  const [scoreRevealed] = useState(true)

  return (
    <article
      id="recommendation-overview"
      className="result-card animate-fade-in-up scroll-mt-32 xl:col-span-2"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="section-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Career Recommendation
            </span>
            <Badge variant={scoreStatus.variant}>{scoreStatus.label}</Badge>
            {assistanceLabel ? (
              <Badge variant="info">{assistanceLabel}</Badge>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Recommended Role
            </p>
            <h3 className="mt-2.5 text-3xl font-bold text-slate-950 sm:text-4xl">
              {data.role}
            </h3>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              {data.subdomain}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="summary-chip animate-fade-in-up delay-1">
            <span className="summary-label">Match Score</span>
            <span className="summary-value">
              {scoreRevealed ? (
                <AnimatedCounter value={data.score} />
              ) : (
                formatScore(data.score)
              )}
            </span>
          </div>
          <div className="summary-chip animate-fade-in-up delay-2">
            <span className="summary-label">Domain</span>
            <span className="summary-value">{data.domain}</span>
          </div>
          <div className="summary-chip animate-fade-in-up delay-3">
            <span className="summary-label">Readiness</span>
            <span className="summary-value">{data.readiness_level}</span>
          </div>
        </div>
      </div>

      {/* Matched Skills & Interests */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="inner-card">
          <p className="inner-title">
            <svg className="mr-2 inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Matched Skills
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {data.matched_skills.length > 0 ? (
              data.matched_skills.map((skill, i) => (
                <span
                  key={skill}
                  className={`tag tag-success animate-scale-in delay-${Math.min(i + 1, 8)}`}
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No strong aligned skills were identified yet.
              </p>
            )}
          </div>
        </div>

        <div className="inner-card">
          <p className="inner-title">
            <svg className="mr-2 inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            Interest Alignment
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {alignedInterests.length ? (
              alignedInterests.map((interest, i) => (
                <span
                  key={interest}
                  className={`tag tag-neutral animate-scale-in delay-${Math.min(i + 1, 8)}`}
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No explicit interests were submitted.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Summary */}
      <div className="mt-5 rounded-[22px] border border-slate-200/80 bg-white/85 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Confidence Summary
        </p>
        <p className="mt-2.5 text-sm leading-7 text-slate-600">
          {data.confidence_summary}
        </p>
      </div>

      {/* AI Warning */}
      {aiWarning ? (
        <div className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50/85 p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            AI Notice
          </p>
          <p className="mt-2.5 text-sm leading-7 text-slate-600">{aiWarning}</p>
        </div>
      ) : null}
    </article>
  )
}
