/**
 * Card component that supports glass, soft, result, and inner variants.
 */

const VARIANT_CLASSES = {
  glass: "glass-panel",
  soft: "soft-panel",
  result: "result-card",
  inner: "inner-card",
}

export default function Card({
  children,
  variant = "result",
  className = "",
  animate = false,
  ...props
}) {
  return (
    <div
      className={`${VARIANT_CLASSES[variant] || ""} ${animate ? "animate-fade-in-up" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
