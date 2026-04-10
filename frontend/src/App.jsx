import { useEffect, useState } from "react"

import Navbar from "./components/Navbar"
import GenerationStudio from "./pages/GenerationStudio"
import Home from "./pages/Home"
import Results from "./pages/Results"

const PROFILE_STORAGE_KEY = "career-ai-profile"
const RESULT_STORAGE_KEY = "career-ai-result"
const AI_ASSISTANCE_STORAGE_KEY = "career-ai-assistance"
const AI_WARNING_STORAGE_KEY = "career-ai-warning"
const GENERATION_STORAGE_KEY = "career-ai-generation"
const RESULT_ROUTE = "/result"
const GENERATION_ROUTE = "/generate"

const readFromStorage = (key) => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const writeToStorage = (key, value) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

const getCurrentRoute = () => {
  if (window.location.pathname === RESULT_ROUTE) {
    return "result"
  }

  if (window.location.pathname === GENERATION_ROUTE) {
    return "generate"
  }

  return "home"
}

function App() {
  const [route, setRoute] = useState(() =>
    typeof window === "undefined" ? "home" : getCurrentRoute(),
  )
  const [profile, setProfile] = useState(() => readFromStorage(PROFILE_STORAGE_KEY))
  const [result, setResult] = useState(() => readFromStorage(RESULT_STORAGE_KEY))
  const [aiAssistance, setAIAssistance] = useState(() =>
    readFromStorage(AI_ASSISTANCE_STORAGE_KEY),
  )
  const [aiWarning, setAIWarning] = useState(() =>
    readFromStorage(AI_WARNING_STORAGE_KEY),
  )
  const [generationState, setGenerationState] = useState(() =>
    readFromStorage(GENERATION_STORAGE_KEY),
  )

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const handlePopState = () => {
      setRoute(getCurrentRoute())
      setProfile(readFromStorage(PROFILE_STORAGE_KEY))
      setResult(readFromStorage(RESULT_STORAGE_KEY))
      setAIAssistance(readFromStorage(AI_ASSISTANCE_STORAGE_KEY))
      setAIWarning(readFromStorage(AI_WARNING_STORAGE_KEY))
      setGenerationState(readFromStorage(GENERATION_STORAGE_KEY))
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if ((route === "result" || route === "generate") && !result) {
      window.history.replaceState({}, "", "/")
      setRoute("home")
    }
  }, [route, result])

  const navigate = (nextRoute) => {
    if (typeof window === "undefined") {
      return
    }

    const nextPath =
      nextRoute === "result"
        ? RESULT_ROUTE
        : nextRoute === "generate"
          ? GENERATION_ROUTE
          : "/"

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath)
    }
    setRoute(nextRoute)
  }

  const handleRecommendationReady = ({
    recommendation,
    submittedProfile,
    aiAssistance: nextAIAssistance = null,
    aiWarning: nextAIWarning = null,
  }) => {
    setResult(recommendation)
    setProfile(submittedProfile)
    setAIAssistance(nextAIAssistance)
    setAIWarning(nextAIWarning)
    writeToStorage(RESULT_STORAGE_KEY, recommendation)
    writeToStorage(PROFILE_STORAGE_KEY, submittedProfile)
    writeToStorage(AI_ASSISTANCE_STORAGE_KEY, nextAIAssistance)
    writeToStorage(AI_WARNING_STORAGE_KEY, nextAIWarning)
    navigate("result")
  }

  const handleNavigateHome = () => {
    navigate("home")
  }

  const handleNavigateResult = () => {
    navigate("result")
  }

  const handleLaunchGeneration = (nextState) => {
    setGenerationState(nextState)
    writeToStorage(GENERATION_STORAGE_KEY, nextState)
    navigate("generate")
  }

  const handleUpdateGeneration = (nextState) => {
    setGenerationState(nextState)
    writeToStorage(GENERATION_STORAGE_KEY, nextState)
  }

  return (
    <div className="app-shell">
      <div className="ambient-grid" />

      <Navbar
        route={route}
        onNavigateHome={handleNavigateHome}
        onNavigateResult={handleNavigateResult}
      />

      <main
        className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          route === "home" ? "pb-6 pt-4" : "pb-10 pt-6"
        }`}
      >
        {route === "result" ? (
          <Results
            profile={profile}
            result={result}
            aiAssistance={aiAssistance}
            aiWarning={aiWarning}
            onNavigateHome={handleNavigateHome}
            onLaunchGeneration={handleLaunchGeneration}
          />
        ) : route === "generate" ? (
          <GenerationStudio
            profile={profile}
            result={result}
            generationState={generationState}
            onLaunchGeneration={handleLaunchGeneration}
            onUpdateGeneration={handleUpdateGeneration}
            onNavigateResult={handleNavigateResult}
          />
        ) : (
          <Home
            initialProfile={profile}
            onRecommendationReady={handleRecommendationReady}
          />
        )}
      </main>
    </div>
  )
}

export default App
