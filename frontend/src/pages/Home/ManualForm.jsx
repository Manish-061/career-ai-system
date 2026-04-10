import { useState, useRef, useEffect } from "react"
import SkillList from "../../components/SkillList"

const EDUCATION_OPTIONS = [
  "B.Tech CSE",
  "B.Tech",
  "B.Tech Mechanical",
  "B.Tech Civil",
  "B.Tech Electrical",
  "BCA",
  "BSc",
  "BSc Nursing",
  "BBA",
  "B.Com",
  "B.Pharm",
  "BA Journalism",
  "MBBS",
  "MBA",
  "MSc",
  "MCA",
  "M.Tech",
  "CA",
  "Certifications",
  "Other",
]

const INTEREST_OPTIONS = [
  "Software Engineering",
  "Web Development",
  "Backend",
  "Frontend",
  "Full Stack",
  "Data Analysis",
  "Data Science",
  "Machine Learning",
  "AI",
  "Data Engineering",
  "Business Intelligence",
  "Product Analytics",
  "Cloud",
  "DevOps",
  "Cybersecurity",
  "Testing",
  "Automation",
  "Product Building",
  "Finance",
  "Accounting",
  "Design",
  "Content Writing",
  "Healthcare",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
]

/**
 * Manual input form — education dropdown, interests multi-select, and skill list.
 * Pure presentation component: receives state + handlers as props.
 */
export default function ManualForm({ education, setEducation, interests, setInterests, skills, setSkills }) {
  // Parse the comma-separated interests string into an array for the multi-select
  const selectedInterests = interests
    ? interests.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const toggleInterest = (interest) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest]
    setInterests(updated.join(", "))
  }

  return (
    <>
      {/* Education Dropdown */}
      <div className="field-group">
        <label className="field-label" htmlFor="education">
          Education
        </label>
        <div className="relative">
          <select
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="field-input field-input-compact appearance-none pr-10 cursor-pointer"
          >
            <option value="">Select your education</option>
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interests Multi-Select */}
      <div className="field-group">
        <label className="field-label">
          Interests
        </label>
        <InterestMultiSelect
          options={INTEREST_OPTIONS}
          selected={selectedInterests}
          onToggle={toggleInterest}
        />
      </div>

      <SkillList skills={skills} setSkills={setSkills} />
    </>
  )
}

/**
 * Custom multi-select dropdown for interests.
 * Shows selected items as tags and a dropdown to pick more.
 */
function InterestMultiSelect({ options, selected, onToggle }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = options.filter(
    (opt) => opt.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div ref={ref} className="relative">
      {/* Trigger / Display Area */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="field-input field-input-compact flex flex-wrap items-center gap-2 min-h-[3rem] text-left cursor-pointer"
      >
        {selected.length > 0 ? (
          selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200/60 px-2.5 py-1 text-xs font-semibold text-cyan-700"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(item)
                }}
                className="text-cyan-500 hover:text-cyan-700 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-sm">Select your interests...</span>
        )}

        {/* Chevron */}
        <div className="ml-auto flex-shrink-0 text-slate-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown Panel */}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 animate-scale-in">
          {/* Search */}
          <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2.5">
            <input
              type="text"
              placeholder="Search interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="py-1.5">
            {filtered.length > 0 ? (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onToggle(opt)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-cyan-50/70 text-cyan-800 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500 text-white"
                          : "border-slate-300"
                      }`}
                      style={{ width: 18, height: 18 }}
                    >
                      {isSelected ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </span>
                    {opt}
                  </button>
                )
              })
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400">No matching interests found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
