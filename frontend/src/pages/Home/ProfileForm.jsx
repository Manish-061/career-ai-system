import { useState } from "react"
import ManualForm from "./ManualForm"
import AIForm from "./AIForm"
import Button from "../../components/ui/Button"
import ErrorBanner from "../../components/ui/ErrorBanner"
import Loader from "../../components/Loader"

const createEmptySkill = () => ({ name: "", rating: "", projects: "" })

const getInitialSkills = (profile) =>
  profile?.skills?.length
    ? profile.skills.map((skill) => ({ ...skill }))
    : [createEmptySkill()]

const modeButtonClass = (active) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
    active
      ? "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
      : "bg-white/60 text-slate-500 hover:bg-white hover:text-slate-700",
  ].join(" ")

export default function ProfileForm({ initialProfile, onSubmit, loading, error, onClearError }) {
  const [inputMode, setInputMode] = useState("manual")
  const [skills, setSkills] = useState(getInitialSkills(initialProfile))
  const [education, setEducation] = useState(initialProfile?.education ?? "")
  const [interests, setInterests] = useState(
    initialProfile?.interests?.join(", ") ?? "",
  )
  const [freeTextProfile, setFreeTextProfile] = useState("")

  const handleSubmit = () => {
    if (inputMode === "manual") {
      onSubmit({
        mode: "manual",
        skills,
        education,
        interests,
      })
    } else {
      onSubmit({
        mode: "ai",
        freeTextProfile,
      })
    }
  }

  return (
    <div className="soft-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8">
      <div className="surface-highlight" />

      <div className="relative z-10 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Candidate Details
            </p>
            <h3 className="mt-1.5 text-[1.85rem] font-semibold tracking-tight text-slate-950 sm:text-[2.1rem]">
              Build your recommendation
            </h3>
          </div>

          <div className="rounded-full bg-slate-100/80 p-1 shadow-sm">
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

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {inputMode === "manual"
            ? "Keep entries concise and specific so the rule engine can score your fit accurately."
            : "Describe your education, tools, and projects in one message. If Gemini is busy, the backup parser will still try to structure your profile."}
        </p>

        <div className="home-form-stack mt-5">
          {inputMode === "manual" ? (
            <ManualForm
              education={education}
              setEducation={setEducation}
              interests={interests}
              setInterests={setInterests}
              skills={skills}
              setSkills={setSkills}
            />
          ) : (
            <AIForm
              freeTextProfile={freeTextProfile}
              setFreeTextProfile={setFreeTextProfile}
            />
          )}

          <ErrorBanner message={error} onDismiss={onClearError} />

          <Button
            variant="primary"
            size="compact"
            loading={loading}
            disabled={loading}
            onClick={handleSubmit}
            className="w-full"
          >
            {loading
              ? inputMode === "manual"
                ? "Generating Recommendation..."
                : "Structuring Profile..."
              : inputMode === "manual"
                ? "Get Recommendation"
                : "Generate with Gemini"}
          </Button>

          {loading ? (
            <Loader
              stages={
                inputMode === "manual"
                  ? ["Analyzing profile", "Matching roles", "Building guidance"]
                  : ["Reading profile", "Extracting skills", "Matching roles", "Building guidance"]
              }
            />
          ) : null}

          <p className="text-xs leading-6 text-slate-400">
            Manual mode uses the same hybrid delivery model: structured input goes
            through the recommendation engine first, and Gemini adds guidance when available.
          </p>
        </div>
      </div>
    </div>
  )
}
