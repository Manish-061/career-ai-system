import { useState, useEffect } from "react"

const STAGES = [
  "Analyzing profile",
  "Matching roles",
  "Building guidance",
]

/**
 * Multi-stage loader that cycles through descriptive messages
 * to indicate meaningful progress to the user.
 */
export default function Loader({ message, stages = STAGES }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!stages?.length) return
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [stages])

  const displayMessage = message || stages[stageIndex]

  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader-spinner" aria-hidden="true" />
      <span className="loader-text">
        {displayMessage}
        <span className="loader-dots" aria-hidden="true">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </span>
      </span>
    </div>
  )
}
