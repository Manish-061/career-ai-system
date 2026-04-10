import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCareer } from "../../context/CareerContext"
import Button from "../../components/ui/Button"
import Textarea from "../../components/ui/Textarea"

const ACTION_META = {
  roadmap: {
    label: "Multi-Day Roadmap",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    prompt:
      "Create a 30-day roadmap tailored to my current recommendation, missing skills, and readiness level.",
  },
  project_ideas: {
    label: "Project Ideas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    prompt:
      "Generate portfolio-ready project ideas that close my biggest skill gaps for this recommendation.",
  },
  career_alternatives: {
    label: "Career Alternatives",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12a4 4 0 1 0-8 0" />
      </svg>
    ),
    prompt:
      "Show nearby career alternatives that still fit my strengths and explain how they compare with the main recommendation.",
  },
}

const getSkillRecommendation = (skill, role) => {
  const normalizedSkill = skill.toLowerCase()

  if (normalizedSkill.includes("power bi"))
    return "Build dashboard projects and reporting workflows to strengthen data visualization capability."
  if (normalizedSkill.includes("statistics"))
    return "Focus on probability, hypothesis testing, and interpretation so your decisions are backed by stronger analysis."
  if (normalizedSkill.includes("sql"))
    return "Practice writing optimized queries and translating business questions into measurable database insights."

  return `Develop one focused learning track and a practical project in ${skill} to improve your readiness for ${role}.`
}

export default function GrowthSection({ data, onNavigateHome }) {
  const navigate = useNavigate()
  const { setGenerationState } = useCareer()

  const [selectedAction, setSelectedAction] = useState("roadmap")
  const [launcherPrompt, setLauncherPrompt] = useState(ACTION_META.roadmap.prompt)

  const handleSelectAction = (action) => {
    setSelectedAction(action)
    setLauncherPrompt(ACTION_META[action].prompt)
  }

  const handleOpenWorkspace = () => {
    setGenerationState({
      action: selectedAction,
      prompt: launcherPrompt,
      title: ACTION_META[selectedAction].label,
      content: "",
      suggestions: [],
      model: "",
      warning: null,
      autoGenerate: true,
    })
    navigate("/generate")
  }

  return (
    <article
      id="recommendation-growth"
      className="result-card animate-fade-in-up delay-2 scroll-mt-32"
    >
      {/* Skill Gap Header */}
      <div className="flex items-center justify-between gap-3">
        <span className="section-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
          </svg>
          Skill Gap Analysis
        </span>
        <span className="text-sm font-semibold text-slate-500">
          {data.missing_skills.length
            ? `${data.missing_skills.length} Skill${data.missing_skills.length > 1 ? "s" : ""} to Develop`
            : "No Critical Gaps"}
        </span>
      </div>

      {/* Skill Gap Table */}
      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90">
        <div className="grid grid-cols-[0.9fr_1.6fr] border-b border-slate-200 bg-slate-50/80">
          <div className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Skill
          </div>
          <div className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Recommendation
          </div>
        </div>

        {data.missing_skills.length > 0 ? (
          data.missing_skills.map((skill, index) => (
            <div
              key={skill}
              className={`grid grid-cols-[0.9fr_1.6fr] transition-colors duration-150 hover:bg-slate-50/80 ${
                index < data.missing_skills.length - 1
                  ? "border-b border-slate-200/60"
                  : ""
              }`}
            >
              <div className="px-5 py-4 text-[0.95rem] font-medium text-slate-900">
                {skill}
              </div>
              <div className="px-5 py-4 text-sm leading-7 text-slate-500">
                {getSkillRecommendation(skill, data.role)}
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-6 text-sm leading-7 text-slate-500">
            Your current skill profile already aligns with the recommendation at
            a high level.
          </div>
        )}
      </div>

      {/* AI Career Studio */}
      <div className="mt-5 rounded-[22px] border border-slate-200/80 bg-slate-50/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              AI Career Studio
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              Open a focused generation workspace to create a roadmap, generate
              project ideas, or explore career alternatives with editable AI output.
            </p>
          </div>

          <Button
            variant="primary"
            size="compact"
            onClick={handleOpenWorkspace}
          >
            Open Workspace
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>

        {/* Action Cards */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(ACTION_META).map(([action, meta]) => (
            <button
              key={action}
              type="button"
              onClick={() => handleSelectAction(action)}
              className={`result-nav-link ${
                selectedAction === action ? "result-nav-link-active" : ""
              }`}
            >
              {meta.icon}
              {meta.label}
            </button>
          ))}
        </div>

        <Textarea
          id="studioPrompt"
          label="Studio Prompt"
          value={launcherPrompt}
          onChange={(e) => setLauncherPrompt(e.target.value)}
          showCount
          className="min-h-[8rem]"
        />

        <p className="mt-3 text-xs leading-6 text-slate-400">
          You can refine the prompt, regenerate the output, and edit the response
          directly inside the dedicated generation page.
        </p>
      </div>

      {/* New Assessment Button */}
      <Button
        variant="primary"
        onClick={onNavigateHome}
        className="mt-5 w-full"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Start a New Assessment
      </Button>
    </article>
  )
}
