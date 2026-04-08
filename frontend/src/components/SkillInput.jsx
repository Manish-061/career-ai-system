export default function SkillInput({ skill, index, handleChange, removeSkill }) {
  return (
    <div className="grid grid-cols-4 gap-3 items-center">

      <input
        type="text"
        placeholder="Skill"
        value={skill.name}
        onChange={(e) => handleChange(index, "name", e.target.value)}
        className="p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Rating (1-10)"
        value={skill.rating}
        onChange={(e) => handleChange(index, "rating", e.target.value)}
        className="p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Projects"
        value={skill.projects}
        onChange={(e) => handleChange(index, "projects", e.target.value)}
        className="p-2 border rounded"
      />

      <button
        onClick={() => removeSkill(index)}
        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
      >
        Remove
      </button>

    </div>
  )
}