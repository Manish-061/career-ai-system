export default function SkillInput({ skill, index, handleChange, removeSkill }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/75 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Skill {index + 1}
        </p>

        <button
          type="button"
          onClick={() => removeSkill(index)}
          className="text-sm font-semibold text-rose-600 transition hover:text-rose-700"
        >
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
        />

        <input
          type="number"
          placeholder="Rating (1-10)"
          min="1"
          max="10"
          value={skill.rating}
          onChange={(event) => handleChange(index, "rating", event.target.value)}
          className="field-input field-input-compact"
        />

        <input
          type="number"
          placeholder="Projects"
          min="0"
          value={skill.projects}
          onChange={(event) => handleChange(index, "projects", event.target.value)}
          className="field-input field-input-compact"
        />
      </div>
    </div>
  )
}
