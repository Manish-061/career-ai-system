const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const readErrorMessage = async (response, fallbackMessage) => {
  try {
    const errorData = await response.json()
    if (typeof errorData?.detail === "string") {
      return errorData.detail
    }
    if (typeof errorData?.error === "string") {
      return errorData.error
    }
    if (typeof errorData?.message === "string") {
      return errorData.message
    }
    return fallbackMessage
  } catch {
    return `${fallbackMessage} (${response.status})`
  }
}

const requestJson = async (path, body, fallbackMessage) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackMessage))
  }

  return response.json()
}

export const getRecommendation = async (data) =>
  requestJson("/recommend", data, "Failed to fetch recommendation")

export const getEnhancedRecommendation = async (data) =>
  requestJson(
    "/recommend/enhanced",
    data,
    "Failed to fetch enhanced recommendation",
  )

export const getAIRecommendation = async (profileText) =>
  requestJson(
    "/ai/recommend",
    { profile_text: profileText },
    "Failed to generate AI-assisted recommendation",
  )

export const generateInteractiveContent = async ({
  action,
  prompt,
  profile,
  recommendation,
  existingOutput = "",
}) =>
  requestJson(
    "/ai/generate",
    {
      action,
      prompt,
      profile,
      recommendation,
      existing_output: existingOutput,
    },
    "Failed to generate interactive content",
  )
