const API_URL = "http://localhost:8000"

export const getRecommendation = async (data) => {
  const response = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch recommendation")
  }

  return response.json()
}