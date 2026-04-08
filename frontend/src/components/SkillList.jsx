import SkillInput from "./SkillInput"

export default function SkillList({ skills, setSkills }) {

  const handleChange = (index, field, value) => {
    const updated = [...skills]
    updated[index][field] = field === "name" ? value : Number(value)
    setSkills(updated)
  }

  const addSkill = () => {
    setSkills([...skills, { name: "", rating: "", projects: "" }])
  }

  const removeSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index)
    setSkills(updated)
  }

  return (
    <div className="space-y-3">

      {skills.map((skill, index) => (
        <SkillInput
          key={index}
          skill={skill}
          index={index}
          handleChange={handleChange}
          removeSkill={removeSkill}
        />
      ))}

      <button
        onClick={addSkill}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Add Skill
      </button>

    </div>
  )
}