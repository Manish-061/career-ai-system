import { useState, useCallback } from "react"

/**
 * Generic async request hook that standardizes loading, error, and data state.
 * Eliminates duplicated try/catch/setLoading/setError patterns across pages.
 *
 * @param {Function} asyncFn - The async function to execute
 * @returns {{ data, loading, error, execute, reset }}
 */
export function useApi(asyncFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError("")
        const result = await asyncFn(...args)
        setData(result)
        return result
      } catch (err) {
        const message = err.message || "Something went wrong. Please try again."
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFn],
  )

  const reset = useCallback(() => {
    setData(null)
    setError("")
    setLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setError("")
  }, [])

  return { data, loading, error, execute, reset, clearError }
}
