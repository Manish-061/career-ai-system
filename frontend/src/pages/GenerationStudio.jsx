import { useEffect, useState } from "react"
import Loader from "../components/Loader"
import { generateInteractiveContent } from "../services/api"

const ACTIONS = {
  roadmap: {
    title: "Multi-Day Roadmap",
    description:
      "Create a structured study and execution plan tailored to the current recommendation.",
    starter:
      "Create a 30-day roadmap tailored to my current recommendation, missing skills, and readiness level.",
  },
  project_ideas: {
    title: "Project Ideas",
    description:
      "Generate portfolio-ready project ideas that prove role fit and close skill gaps.",
    starter:
      "Generate portfolio-ready project ideas that close my biggest skill gaps for this recommendation.",
  },
  career_alternatives: {
    title: "Career Alternatives",
    description:
      "Explore nearby roles and understand the trade-offs before committing to one path.",
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

export default function GenerationStudio({
  profile,
  result,
  generationState,
  onLaunchGeneration,
  onUpdateGeneration,
  onNavigateResult,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentState = generationState || createGenerationState("roadmap")
  const currentAction = currentState.action || "roadmap"

  useEffect(() => {
    if (!profile || !result) {
      return
    }

    if (!currentState.autoGenerate) {
      return
    }

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

        onUpdateGeneration({
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
        onUpdateGeneration({
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
    onUpdateGeneration,
    profile,
    result,
  ])

  const handleChangeAction = (action) => {
    onLaunchGeneration(createGenerationState(action))
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

      onUpdateGeneration({
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
    onUpdateGeneration({
      ...currentState,
      prompt: expandedPrompt,
    })
    handleGenerate(expandedPrompt)
  }

  if (!profile || !result) {
    return (
      <section className="mx-auto max-w-3xl py-16">
        <div className="soft-panel rounded-[32px] p-8 text-center sm:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            No Generation Context
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Open the result page first to launch the AI workspace.
          </h2>
          <button
            type="button"
            onClick={onNavigateResult}
            className="primary-button mt-8"
          >
            Back to Results
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5 py-4">
      <div className="soft-panel rounded-[32px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-cyan-700">
              AI Generation Workspace
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Generate, refine, and edit career guidance in one focused workspace.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Start from your recommendation, adjust the prompt, regenerate as needed,
              and edit the generated output directly before you use it.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <span className="font-semibold text-slate-900">Current role:</span>{" "}
            {result.role}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <aside className="result-card">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Actions
          </p>
          <div className="mt-4 space-y-3">
            {Object.entries(ACTIONS).map(([action, meta]) => (
              <button
                key={action}
                type="button"
                onClick={() => handleChangeAction(action)}
                className={`generation-action-card ${
                  currentAction === action ? "generation-action-card-active" : ""
                }`}
              >
                <span className="generation-action-title">{meta.title}</span>
                <span className="generation-action-copy">{meta.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 field-group">
            <label className="field-label" htmlFor="generationPrompt">
              Prompt
            </label>
            <textarea
              id="generationPrompt"
              value={currentState.prompt}
              onChange={(event) =>
                onUpdateGeneration({
                  ...currentState,
                  prompt: event.target.value,
                })
              }
              className="field-input min-h-[12rem] resize-none"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="primary-button justify-center disabled:cursor-not-allowed disabled:opacity-70"
            >
              {currentState.content ? "Regenerate Response" : "Generate Response"}
            </button>
            <button
              type="button"
              onClick={handleExpand}
              disabled={loading}
              className="secondary-button justify-center disabled:cursor-not-allowed disabled:opacity-70"
            >
              Expand Output
            </button>
          </div>

          {currentState.suggestions?.length ? (
            <div className="mt-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Prompt Suggestions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentState.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      onUpdateGeneration({
                        ...currentState,
                        prompt: `${currentState.prompt}\n\n${suggestion}`,
                      })
                    }
                    className="result-nav-link"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <section className="result-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Generated Output
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                {currentState.title || ACTIONS[currentAction].title}
              </h3>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <span className="font-semibold text-slate-900">Model:</span>{" "}
              {currentState.model || "Waiting to generate"}
            </div>
          </div>

          {currentState.warning ? (
            <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50/90 p-4 text-sm leading-7 text-slate-700">
              {currentState.warning}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50/90 p-4 text-sm leading-7 text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? <div className="mt-5"><Loader /></div> : null}

          <div className="mt-5 field-group">
            <label className="field-label" htmlFor="generationTitle">
              Title
            </label>
            <input
              id="generationTitle"
              value={currentState.title}
              onChange={(event) =>
                onUpdateGeneration({
                  ...currentState,
                  title: event.target.value,
                })
              }
              className="field-input"
            />
          </div>

          <div className="mt-5 field-group">
            <label className="field-label" htmlFor="generationContent">
              Editable Output
            </label>
            <textarea
              id="generationContent"
              value={currentState.content}
              onChange={(event) =>
                onUpdateGeneration({
                  ...currentState,
                  content: event.target.value,
                })
              }
              className="field-input min-h-[28rem] resize-y"
              placeholder="Generate content to begin editing."
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="primary-button disabled:cursor-not-allowed disabled:opacity-70"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleExpand}
              disabled={loading}
              className="secondary-button disabled:cursor-not-allowed disabled:opacity-70"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={onNavigateResult}
              className="secondary-button"
            >
              Back to Results
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
