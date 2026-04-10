import { createContext, useContext, useCallback, useState, useEffect } from "react"

const STORAGE_KEYS = {
  profile: "career-ai-profile",
  result: "career-ai-result",
  aiAssistance: "career-ai-assistance",
  aiWarning: "career-ai-warning",
  generation: "career-ai-generation",
}

const readFromStorage = (key) => {
  try {
    const value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const writeToStorage = (key, value) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

const CareerContext = createContext(null)

export function CareerProvider({ children }) {
  const [profile, setProfileState] = useState(() => readFromStorage(STORAGE_KEYS.profile))
  const [result, setResultState] = useState(() => readFromStorage(STORAGE_KEYS.result))
  const [aiAssistance, setAiAssistanceState] = useState(() => readFromStorage(STORAGE_KEYS.aiAssistance))
  const [aiWarning, setAiWarningState] = useState(() => readFromStorage(STORAGE_KEYS.aiWarning))
  const [generationState, setGenerationStateInternal] = useState(() => readFromStorage(STORAGE_KEYS.generation))

  const setProfile = useCallback((next) => {
    setProfileState(next)
    writeToStorage(STORAGE_KEYS.profile, next)
  }, [])

  const setResult = useCallback((next) => {
    setResultState(next)
    writeToStorage(STORAGE_KEYS.result, next)
  }, [])

  const setAiAssistance = useCallback((next) => {
    setAiAssistanceState(next)
    writeToStorage(STORAGE_KEYS.aiAssistance, next)
  }, [])

  const setAiWarning = useCallback((next) => {
    setAiWarningState(next)
    writeToStorage(STORAGE_KEYS.aiWarning, next)
  }, [])

  const setGenerationState = useCallback((next) => {
    setGenerationStateInternal(next)
    writeToStorage(STORAGE_KEYS.generation, next)
  }, [])

  const handleRecommendationReady = useCallback(
    ({ recommendation, submittedProfile, aiAssistance: nextAi = null, aiWarning: nextWarn = null }) => {
      setResult(recommendation)
      setProfile(submittedProfile)
      setAiAssistance(nextAi)
      setAiWarning(nextWarn)
    },
    [setResult, setProfile, setAiAssistance, setAiWarning],
  )

  // Restore from storage on popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setProfileState(readFromStorage(STORAGE_KEYS.profile))
      setResultState(readFromStorage(STORAGE_KEYS.result))
      setAiAssistanceState(readFromStorage(STORAGE_KEYS.aiAssistance))
      setAiWarningState(readFromStorage(STORAGE_KEYS.aiWarning))
      setGenerationStateInternal(readFromStorage(STORAGE_KEYS.generation))
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const value = {
    profile,
    result,
    aiAssistance,
    aiWarning,
    generationState,
    setProfile,
    setResult,
    setAiAssistance,
    setAiWarning,
    setGenerationState,
    handleRecommendationReady,
  }

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>
}

export function useCareer() {
  const context = useContext(CareerContext)
  if (!context) {
    throw new Error("useCareer must be used within a CareerProvider")
  }
  return context
}
