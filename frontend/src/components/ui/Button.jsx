/**
 * Reusable Button component with primary/secondary/ghost variants,
 * loading state, and size options.
 */
export default function Button({
  children,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseClass =
    variant === "primary"
      ? `primary-button ${size === "compact" ? "primary-button-compact" : ""}`
      : variant === "secondary"
        ? `secondary-button ${size === "compact" ? "secondary-button-compact" : ""}`
        : "secondary-button secondary-button-compact"

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className={`btn-spinner ${variant !== "primary" ? "btn-spinner-dark" : ""}`}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  )
}
