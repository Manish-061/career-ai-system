/**
 * Shimmer skeleton loading placeholder with multiple shape variants.
 */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={className} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function SkeletonHeading({ className = "" }) {
  return <div className={`skeleton skeleton-heading ${className}`} role="status" aria-label="Loading" />
}

export function SkeletonChip({ className = "" }) {
  return <div className={`skeleton skeleton-chip ${className}`} role="status" aria-label="Loading" />
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton skeleton-block ${className}`} role="status" aria-label="Loading" />
}

/**
 * Full-card skeleton placeholder matching result-card layout.
 */
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`result-card space-y-5 ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <div className="flex flex-wrap gap-3">
        <SkeletonChip />
        <SkeletonChip className="w-24" />
      </div>
      <SkeletonHeading />
      <SkeletonText lines={4} />
      <div className="flex gap-3">
        <SkeletonChip />
        <SkeletonChip />
        <SkeletonChip />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
