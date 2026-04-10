import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCareer } from "../../context/CareerContext"
import { generateInteractiveContent } from "../../services/api"
import Loader from "../../components/Loader"
import Button from "../../components/ui/Button"
import Textarea from "../../components/ui/Textarea"
import ErrorBanner from "../../components/ui/ErrorBanner"
import EmptyState from "../../components/ui/EmptyState"
import PageTransition from "../../components/ui/PageTransition"

const ACTIONS = {
  roadmap: {
    title: "Multi-Day Roadmap",
    description:
      "Create a structured study and execution plan tailored to the current recommendation.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    starter:
      "Create a 30-day roadmap tailored to my current recommendation, missing skills, and readiness level.",
  },
  project_ideas: {
    title: "Project Ideas",
    description:
      "Generate portfolio-ready project ideas that prove role fit and close skill gaps.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    starter:
      "Generate portfolio-ready project ideas that close my biggest skill gaps for this recommendation.",
  },
  career_alternatives: {
    title: "Career Alternatives",
    description:
      "Explore nearby roles and understand the trade-offs before committing to one path.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12a4 4 0 1 0-8 0" />
      </svg>
    ),
    starter:
      "Show nearby career alternatives that still fit my strengths and explain how they compare with the main recommendation.",
  },
}

const createGenerationState = (action) => ({
  action,
  prompt: ACTIONS[action].starter,
  title: ACTIONS[action].title,
  content: "",
  suggestions: [],
  model: "",
  warning: null,
  autoGenerate: true,
})

export default function GenerationStudio() {
  const navigate = useNavigate()
  const { profile, result, generationState, setGenerationState } = useCareer()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentState = generationState || createGenerationState("roadmap")
  const currentAction = currentState.action || "roadmap"

  const clearError = useCallback(() => setError(""), [])

  useEffect(() => {
    if (!profile || !result) return
    if (!currentState.autoGenerate) return

    const run = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await generateInteractiveContent({
          action: currentAction,
          prompt: currentState.prompt,
          profile,
          recommendation: result,
          existingOutput: currentState.content,
        })

        setGenerationState({
          ...currentState,
          title: response.title,
          content: response.content,
          suggestions: response.suggestions,
          model: response.model,
          warning: response.warning,
          autoGenerate: false,
        })
      } catch (err) {
        setError(err.message || "Unable to generate content right now.")
        setGenerationState({
          ...currentState,
          autoGenerate: false,
        })
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [
    currentAction,
    currentState,
    setGenerationState,
    profile,
    result,
  ])

  const handleChangeAction = (action) => {
    setGenerationState(createGenerationState(action))
  }

  const handleGenerate = async (nextPrompt = currentState.prompt) => {
    try {
      setLoading(true)
      setError("")

      const response = await generateInteractiveContent({
        action: currentAction,
        prompt: nextPrompt,
        profile,
        recommendation: result,
        existingOutput: currentState.content,
      })

      setGenerationState({
        ...currentState,
        prompt: nextPrompt,
        title: response.title,
        content: response.content,
        suggestions: response.suggestions,
        model: response.model,
        warning: response.warning,
        autoGenerate: false,
      })
    } catch (err) {
      setError(err.message || "Unable to generate content right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleExpand = () => {
    const expandedPrompt = `${currentState.prompt}\n\nPlease expand the output with more detail, examples, and a clearer execution checklist.`
    setGenerationState({
      ...currentState,
      prompt: expandedPrompt,
    })
    handleGenerate(expandedPrompt)
  }

  const goResult = () => navigate("/result")

  if (!profile || !result) {
    return (
      <PageTransition>
        <section className="mx-auto max-w-3xl py-16">
          <div className="soft-panel rounded-[32px] p-8 sm:p-10">
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              title="No Generation Context"
              description="Open the result page first to launch the AI workspace."
              action={<Button onClick={goResult}>Back to Results</Button>}
            />
          </div>
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <section className="space-y-5 py-4">
        {/* Header */}
        <div className="soft-panel animate-fade-in-up rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-cyan-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                AI Generation Workspace
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Generate, refine, and edit career guidance.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Start from your recommendation, adjust the prompt, regenerate as needed,
                and edit the generated output directly before you use it.
              </p>
            </div>

            <div className="flex-shrink-0 rounded-[20px] border border-slate-200/80 bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-sm">
              <span className="font-semibold text-slate-900">Current role:</span>{" "}
              {result.role}
            </div>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">

          {/* ── Left: Actions & Prompt ── */}
          <aside className="result-card animate-fade-in-up delay-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Actions
            </p>
            <div className="mt-4 space-y-2.5">
              {Object.entries(ACTIONS).map(([action, meta]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleChangeAction(action)}
                  className={`generation-action-card ${
                    currentAction === action ? "generation-action-card-active" : ""
                  }`}
                >
                  <span className="flex items-center gap-2.5 generation-action-title">
                    <span className={currentAction === action ? "text-cyan-600" : "text-slate-400"}>
                      {meta.icon}
                    </span>
                    {meta.title}
                  </span>
                  <span className="generation-action-copy">{meta.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Textarea
                id="generationPrompt"
                label="Prompt"
                value={currentState.prompt}
                showCount
                onChange={(event) =>
                  setGenerationState({
                    ...currentState,
                    prompt: event.target.value,
                  })
                }
                className="min-h-[12rem]"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                variant="primary"
                loading={loading}
                disabled={loading}
                onClick={() => handleGenerate()}
              >
                {currentState.content ? "Regenerate" : "Generate"}
              </Button>
              <Button
                variant="secondary"
                loading={loading}
                disabled={loading}
                onClick={handleExpand}
              >
                Expand Output
              </Button>
            </div>

            {currentState.suggestions?.length ? (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Prompt Suggestions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentState.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setGenerationState({
                          ...currentState,
                          prompt: `${currentState.prompt}\n\n${suggestion}`,
                        })
                      }
                      className="result-nav-link animate-scale-in"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>

          {/* ── Right: Generated Output ── */}
          <section className="result-card animate-fade-in-up delay-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Generated Output
                </p>
                <h3 className="mt-1.5 text-xl font-bold text-slate-950">
                  {currentState.title || ACTIONS[currentAction].title}
                </h3>
              </div>

              <div className="flex-shrink-0 rounded-[18px] border border-slate-200/80 bg-white/85 px-3.5 py-2.5 text-xs text-slate-500 shadow-sm">
                <span className="font-semibold text-slate-800">Model:</span>{" "}
                {currentState.model || "Waiting to generate"}
              </div>
            </div>

            {currentState.warning ? (
              <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50/85 p-4 text-sm leading-7 text-slate-600">
                <span className="font-semibold text-amber-700">⚠ Notice:</span>{" "}
                {currentState.warning}
              </div>
            ) : null}

            <ErrorBanner message={error} onDismiss={clearError} />

            {loading ? <div className="mt-4"><Loader stages={["Generating content", "Formatting output", "Adding suggestions"]} /></div> : null}

            <div className="mt-4">
              <Textarea
                id="generationTitle"
                label="Title"
                value={currentState.title}
                onChange={(event) =>
                  setGenerationState({
                    ...currentState,
                    title: event.target.value,
                  })
                }
              />
            </div>

            <div className="mt-4">
              <Textarea
                id="generationContent"
                label="Editable Output"
                value={currentState.content}
                showCount
                onChange={(event) =>
                  setGenerationState({
                    ...currentState,
                    content: event.target.value,
                  })
                }
                className="min-h-[28rem] !resize-y"
                placeholder="Generate content to begin editing."
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="primary"
                loading={loading}
                disabled={loading}
                onClick={() => handleGenerate()}
              >
                Regenerate
              </Button>
              <Button
                variant="secondary"
                loading={loading}
                disabled={loading}
                onClick={handleExpand}
              >
                Expand
              </Button>
              <Button
                variant="secondary"
                onClick={goResult}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Results
              </Button>
            </div>
          </section>

        </div>
      </section>
    </PageTransition>
  )
}
