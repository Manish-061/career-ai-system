import SkillInput from "./SkillInput"

export default function SkillList({ skills, setSkills }) {
  const handleChange = (index, field, value) => {
    const updated = [...skills]
    updated[index][field] = field === "name" ? value : value
    setSkills(updated)
  }

  const addSkill = () => {
    setSkills([...skills, { name: "", rating: "", projects: "" }])
  }

  const removeSkill = (index) => {
    const updated = skills.filter((_, currentIndex) => currentIndex !== index)
    setSkills(updated.length > 0 ? updated : [{ name: "", rating: "", projects: "" }])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="field-label">Skill Profile</p>
          <p className="mt-1 text-sm text-slate-500">
            Add the skills that best represent your current working strength.
          </p>
        </div>

        <button
          type="button"
          onClick={addSkill}
          className="secondary-button secondary-button-compact"
        >
          Add Skill
        </button>
      </div>

      {skills.map((skill, index) => (
        <SkillInput
          key={index}
          skill={skill}
          index={index}
          handleChange={handleChange}
          removeSkill={removeSkill}
        />
      ))}
    </div>
  )
}
