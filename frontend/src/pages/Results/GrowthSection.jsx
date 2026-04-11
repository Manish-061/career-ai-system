import { useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"

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

