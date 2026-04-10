/**
 * Individual skill card with enhanced visual styling.
 * API contract preserved: skill, index, handleChange, removeSkill.
 */
export default function SkillInput({ skill, index, handleChange, removeSkill }) {
  return (
    <div className="animate-fade-in-up rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
            {index + 1}
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Skill
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeSkill(index)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400 focus-visible:outline-offset-2"
          aria-label={`Remove skill ${index + 1}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Remove
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <input
          type="text"
          placeholder="Skill name"
          value={skill.name}
          onChange={(event) => handleChange(index, "name", event.target.value)}
          className="field-input field-input-compact"
          aria-label={`Skill ${index + 1} name`}
        />

        <input
          type="number"
          placeholder="Rating (1-10)"
          min="1"
          max="10"
          value={skill.rating}
          onChange={(event) => handleChange(index, "rating", event.target.value)}
          className="field-input field-input-compact"
          aria-label={`Skill ${index + 1} rating`}
        />

        <input
          type="number"
          placeholder="Projects"
          min="0"
          value={skill.projects}
          onChange={(event) => handleChange(index, "projects", event.target.value)}
          className="field-input field-input-compact"
          aria-label={`Skill ${index + 1} project count`}
        />
      </div>
    </div>
  )
}
