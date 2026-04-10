import SkillInput from "./SkillInput"
import Button from "./ui/Button"

export default function SkillList({ skills, setSkills }) {
  const handleChange = (index, field, value) => {
    const updated = [...skills]
    updated[index][field] = value
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
      {/* Header */}
      <div>
        <p className="field-label">Skill Profile</p>
        <p className="mt-1 text-sm text-slate-500">
          Add the skills that best represent your current working strength.
        </p>
      </div>

      {/* Skill Cards */}
      {skills.map((skill, index) => (
        <SkillInput
          key={index}
          skill={skill}
          index={index}
          handleChange={handleChange}
          removeSkill={removeSkill}
        />
      ))}

      {/* Add Skill Button — below skills */}
      <Button variant="secondary" size="compact" onClick={addSkill} className="w-full">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Skill
      </Button>
    </div>
  )
}
