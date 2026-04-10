import { useEffect, useState } from "react"

/**
 * Dismissible error banner with shake animation and auto-dismiss.
 */
export default function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs = 10000,
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
  }, [message])

  useEffect(() => {
    if (!autoDismissMs || !message) return
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, autoDismissMs)
    return () => clearTimeout(timer)
  }, [message, autoDismissMs, onDismiss])

  if (!message || !visible) return null

  return (
    <div className="error-banner" role="alert">
      <svg
        className="error-banner-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="flex-1">{message}</span>
      <button
        type="button"
        className="error-banner-dismiss"
        onClick={() => {
          setVisible(false)
          onDismiss?.()
        }}
        aria-label="Dismiss error"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
