import { useState } from "react"

import Loader from "../components/Loader"
import SkillList from "../components/SkillList"
import {
  getAIRecommendation,
  getEnhancedRecommendation,
} from "../services/api"

const createEmptySkill = () => ({ name: "", rating: "", projects: "" })

const getInitialSkills = (profile) =>
  profile?.skills?.length
    ? profile.skills.map((skill) => ({ ...skill }))
    : [createEmptySkill()]

const modeButtonClass = (active) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    active
      ? "bg-slate-950 text-white shadow-[0_10px_25px_rgba(15,23,42,0.15)]"
      : "bg-white/70 text-slate-600 hover:bg-white",
  ].join(" ")

export default function Home({ initialProfile, onRecommendationReady }) {
  const [inputMode, setInputMode] = useState("manual")
  const [skills, setSkills] = useState(getInitialSkills(initialProfile))
  const [education, setEducation] = useState(initialProfile?.education ?? "")
  const [interests, setInterests] = useState(
    initialProfile?.interests?.join(", ") ?? "",
  )
  const [freeTextProfile, setFreeTextProfile] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleManualSubmit = async () => {
    const touchedSkills = skills.filter(
      (skill) =>
        skill.name.trim() !== "" || skill.rating !== "" || skill.projects !== "",
    )

    if (!education.trim()) {
      setError("Please enter your education background before continuing.")
      return
    }

    if (touchedSkills.length === 0) {
      setError("Add at least one skill with a rating and project count.")
      return
    }

    const hasIncompleteSkill = touchedSkills.some(
      (skill) => !skill.name.trim() || skill.rating === "" || skill.projects === "",
    )

    if (hasIncompleteSkill) {
      setError("Complete every skill row before requesting a recommendation.")
      return
    }

    const cleanedSkills = touchedSkills.map((skill) => ({
      name: skill.name.trim(),
      rating: Number(skill.rating),
      projects: Number(skill.projects),
    }))

    const hasInvalidSkill = cleanedSkills.some(
      (skill) =>
        Number.isNaN(skill.rating) ||
        Number.isNaN(skill.projects) ||
        skill.rating < 1 ||
        skill.rating > 10 ||
        skill.projects < 0,
    )

    if (hasInvalidSkill) {
      setError("Use ratings between 1 and 10, and project counts of 0 or more.")
      return
    }

    const payload = {
      skills: cleanedSkills,
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      education: education.trim(),
    }

    const data = await getEnhancedRecommendation(payload)
    onRecommendationReady({
      recommendation: data.recommendation,
      submittedProfile: payload,
      aiAssistance: data.ai_assistance,
      aiWarning: data.ai_warning,
    })
  }

  const handleAISubmit = async () => {
    if (!freeTextProfile.trim()) {
      setError("Describe your profile so Gemini can extract your skills and interests.")
      return
    }

    const data = await getAIRecommendation(freeTextProfile.trim())

    onRecommendationReady({
      recommendation: data.recommendation,
      submittedProfile: data.parsed_profile,
      aiAssistance: data.ai_assistance,
      aiWarning: data.ai_warning,
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError("")

      if (inputMode === "manual") {
        await handleManualSubmit()
      } else {
        await handleAISubmit()
      }
    } catch (err) {
      setError(err.message || "Unable to fetch your recommendation right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="home-shell">
      <div className="home-grid">
        <div className="glass-panel home-panel home-panel-dark rounded-[32px] p-6 sm:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
              Career Planning Workspace
            </p>
            <h2 className="home-hero-title mt-3 max-w-xl font-semibold tracking-tight text-white">
              Build a clear recommendation with a cleaner, more guided workflow.
            </h2>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-slate-200">
              Use structured input for precision, or let Gemini interpret your profile.
              The recommendation engine scores the fit, and the AI layer helps you
              explore the next move with less friction.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="metric-card metric-card-compact">
              <span className="metric-kicker">Step 1</span>
              <h3 className="metric-title">Profile Input</h3>
              <p className="metric-copy">
                Enter structured details or describe your background in natural language.
              </p>
            </div>

            <div className="metric-card metric-card-compact">
              <span className="metric-kicker">Step 2</span>
              <h3 className="metric-title">Hybrid Reasoning</h3>
              <p className="metric-copy">
                Rules score the fit, while Gemini supports parsing and deeper guidance.
              </p>
            </div>

            <div className="metric-card metric-card-compact">
              <span className="metric-kicker">Step 3</span>
              <h3 className="metric-title">Interactive Output</h3>
              <p className="metric-copy">
                Review the result, inspect the gaps, and open the AI studio when needed.
              </p>
            </div>
          </div>
        </div>

        <div className="soft-panel home-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8">
          <div className="surface-highlight" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
                  Candidate Details
                </p>
                <h3 className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
                  Build your recommendation input
                </h3>
              </div>

              <div className="rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  className={modeButtonClass(inputMode === "manual")}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("ai")}
                  className={modeButtonClass(inputMode === "ai")}
                >
                  Gemini Assist
                </button>
              </div>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {inputMode === "manual"
                ? "Keep entries concise and specific so the rule engine can score your fit accurately."
                : "Describe your education, tools, and projects in one message. If Gemini is busy, the backup parser will still try to structure your profile."}
            </p>

            <div className="home-form-stack mt-5">
              {inputMode === "manual" ? (
                <>
                  <div className="field-group">
                    <label className="field-label" htmlFor="education">
                      Education
                    </label>
                    <input
                      id="education"
                      type="text"
                      placeholder="e.g. B.Tech in Computer Science"
                      value={education}
                      onChange={(event) => setEducation(event.target.value)}
                      className="field-input field-input-compact"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="interests">
                      Interests
                    </label>
                    <input
                      id="interests"
                      type="text"
                      placeholder="e.g. Data Analysis, Machine Learning, Product"
                      value={interests}
                      onChange={(event) => setInterests(event.target.value)}
                      className="field-input field-input-compact"
                    />
                  </div>

                  <SkillList skills={skills} setSkills={setSkills} />
                </>
              ) : (
                <>
                  <div className="rounded-[24px] border border-cyan-100 bg-cyan-50/75 p-4 text-sm leading-6 text-cyan-950">
                    Gemini will extract skills, interests, education, and likely gaps
                    from your description. If the live model is temporarily unavailable,
                    the backup parser will still structure the profile as far as possible.
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="profileText">
                      Describe Your Profile
                    </label>
                    <textarea
                      id="profileText"
                      rows="8"
                      placeholder="Example: I am a B.Tech student, comfortable with Python and SQL, built one dashboard project, and I want to move into data analyst roles."
                      value={freeTextProfile}
                      onChange={(event) => setFreeTextProfile(event.target.value)}
                      className="field-input field-input-compact min-h-[14rem] resize-none"
                    />
                  </div>
                </>
              )}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="primary-button primary-button-compact w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? inputMode === "manual"
                    ? "Generating Recommendation..."
                    : "Structuring Profile And Generating Recommendation..."
                  : inputMode === "manual"
                    ? "Get Recommendation"
                    : "Generate with Gemini"}
              </button>

              {loading ? <Loader /> : null}

              <p className="text-xs leading-6 text-slate-500">
                Manual mode uses the same hybrid delivery model: structured input goes
                through the recommendation engine first, and Gemini adds guidance when available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
