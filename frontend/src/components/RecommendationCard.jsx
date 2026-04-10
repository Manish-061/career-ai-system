import { useState } from "react"

const ACTION_META = {
  roadmap: {
    label: "Multi-Day Roadmap",
    prompt:
      "Create a 30-day roadmap tailored to my current recommendation, missing skills, and readiness level.",
  },
  project_ideas: {
    label: "Project Ideas",
    prompt:
      "Generate portfolio-ready project ideas that close my biggest skill gaps for this recommendation.",
  },
  career_alternatives: {
    label: "Career Alternatives",
    prompt:
      "Show nearby career alternatives that still fit my strengths and explain how they compare with the main recommendation.",
  },
}

const getScoreStatus = (score) => {
  if (score >= 0.75) {
    return {
      label: "Strong Match",
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-100/80",
    }
  }

  if (score >= 0.5) {
    return {
      label: "Promising Fit",
      badgeClass:
        "border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/80",
    }
  }

  return {
    label: "Growth Opportunity",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700 shadow-rose-100/80",
  }
}

const getSkillRecommendation = (skill, role) => {
  const normalizedSkill = skill.toLowerCase()

  if (normalizedSkill.includes("power bi")) {
    return "Build dashboard projects and reporting workflows to strengthen data visualization capability."
  }

  if (normalizedSkill.includes("statistics")) {
    return "Focus on probability, hypothesis testing, and interpretation so your decisions are backed by stronger analysis."
  }

  if (normalizedSkill.includes("sql")) {
    return "Practice writing optimized queries and translating business questions into measurable database insights."
  }

  return `Develop one focused learning track and a practical project in ${skill} to improve your readiness for ${role}.`
}

const getExplanationPoints = (explanation) =>
  explanation
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}.`)

const formatScore = (score) => Number(score ?? 0).toFixed(2)

export default function RecommendationCard({
  data,
  profile,
  aiAssistance,
  aiWarning,
  onNavigateHome,
  onLaunchGeneration,
}) {
  const scoreStatus = getScoreStatus(data.score)
  const explanationPoints = getExplanationPoints(data.explanation)
  const alignedInterests = data.matched_interests?.length
    ? data.matched_interests
    : profile?.interests || []
  const assistanceLabel = aiAssistance?.model === "heuristic-parser"
    ? "Backup Parser Assisted"
    : aiAssistance
      ? "AI Assisted"
      : null

  const [selectedAction, setSelectedAction] = useState("roadmap")
  const [launcherPrompt, setLauncherPrompt] = useState(ACTION_META.roadmap.prompt)

  const handleSelectAction = (action) => {
    setSelectedAction(action)
    setLauncherPrompt(ACTION_META[action].prompt)
  }

  const handleOpenWorkspace = () => {
    onLaunchGeneration({
      action: selectedAction,
      prompt: launcherPrompt,
      title: ACTION_META[selectedAction].label,
      content: "",
      suggestions: [],
      model: "",
      warning: null,
      autoGenerate: true,
    })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <article
        id="recommendation-overview"
        className="result-card scroll-mt-32 xl:col-span-2"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-pill">Career Recommendation</span>
              <span
                className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${scoreStatus.badgeClass}`}
              >
                {scoreStatus.label}
              </span>
              {assistanceLabel ? (
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
                  {assistanceLabel}
                </span>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                Recommended Role
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                {data.role}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {data.subdomain}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="summary-chip">
              <span className="summary-label">Match Score</span>
              <span className="summary-value">{formatScore(data.score)}</span>
            </div>
            <div className="summary-chip">
              <span className="summary-label">Domain</span>
              <span className="summary-value">{data.domain}</span>
            </div>
            <div className="summary-chip">
              <span className="summary-label">Readiness</span>
              <span className="summary-value">{data.readiness_level}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="inner-card">
            <p className="inner-title">Matched Skills</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.matched_skills.length > 0 ? (
                data.matched_skills.map((skill) => (
                  <span key={skill} className="tag tag-success">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No strong aligned skills were identified yet.
                </p>
              )}
            </div>
          </div>

          <div className="inner-card">
            <p className="inner-title">Interest Alignment</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {alignedInterests.length ? (
                alignedInterests.map((interest) => (
                  <span key={interest} className="tag tag-neutral">
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No explicit interests were submitted.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/80 p-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Confidence Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {data.confidence_summary}
          </p>
        </div>

        {aiWarning ? (
          <div className="mt-4 rounded-[24px] border border-amber-200 bg-amber-50/90 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
              AI Notice
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{aiWarning}</p>
          </div>
        ) : null}
      </article>

      <article
        id="recommendation-explanation"
        className="result-card scroll-mt-32"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="section-pill">Explanation of Recommendation</span>
          <span className="text-sm font-semibold text-slate-500">
            Score {formatScore(data.score)}
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-base font-semibold text-slate-900">
            Reason for Recommendation: {data.role}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {explanationPoints.map((point) => (
            <div
              key={point}
              className="flex gap-3 rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm"
            >
              <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.16)]" />
              <p className="text-sm leading-7 text-slate-700">{point}</p>
            </div>
          ))}
        </div>

        {aiAssistance ? (
          <div className="mt-5 rounded-[24px] border border-cyan-200 bg-cyan-50/75 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">
                AI Guidance Summary
              </span>
              <span className="text-sm font-semibold text-cyan-900">
                Confidence {formatScore(aiAssistance.parse_confidence)}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {aiAssistance.summary}
            </p>
          </div>
        ) : null}
      </article>

      <article
        id="recommendation-growth"
        className="result-card scroll-mt-32"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="section-pill">Skill Gap Analysis</span>
          <span className="text-sm font-semibold text-slate-500">
            {data.missing_skills.length
              ? "Missing Skills Identified"
              : "No Critical Gaps"}
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white/85">
          <div className="grid grid-cols-[0.9fr_1.6fr] border-b border-slate-200 bg-slate-50/80">
            <div className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Skill
            </div>
            <div className="px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recommendation
            </div>
          </div>

          {data.missing_skills.length > 0 ? (
            data.missing_skills.map((skill, index) => (
              <div
                key={skill}
                className={`grid grid-cols-[0.9fr_1.6fr] ${
                  index < data.missing_skills.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <div className="px-5 py-4 text-base font-medium text-slate-900">
                  {skill}
                </div>
                <div className="px-5 py-4 text-sm leading-7 text-slate-600">
                  {getSkillRecommendation(skill, data.role)}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-sm leading-7 text-slate-600">
              Your current skill profile already aligns with the recommendation at
              a high level.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                AI Career Studio
              </p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
                Open a focused generation workspace to create a roadmap, generate
                project ideas, or explore career alternatives with editable AI output.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenWorkspace}
              className="primary-button primary-button-compact"
            >
              Open Workspace
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(ACTION_META).map(([action, meta]) => (
              <button
                key={action}
                type="button"
                onClick={() => handleSelectAction(action)}
                className={`result-nav-link ${
                  selectedAction === action ? "border-cyan-300 bg-cyan-50 text-cyan-700" : ""
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <div className="mt-4 field-group">
            <label className="field-label" htmlFor="studioPrompt">
              Studio Prompt
            </label>
            <textarea
              id="studioPrompt"
              value={launcherPrompt}
              onChange={(event) => setLauncherPrompt(event.target.value)}
              className="field-input min-h-[8.5rem] resize-none"
              placeholder="Tell the AI workspace exactly what you want to generate."
            />
          </div>

          <p className="mt-3 text-xs leading-6 text-slate-500">
            You can refine the prompt, regenerate the output, and edit the response
            directly inside the dedicated generation page.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="primary-button mt-5 w-full justify-center"
        >
          Start a New Assessment
        </button>
      </article>
    </div>
  )
}
