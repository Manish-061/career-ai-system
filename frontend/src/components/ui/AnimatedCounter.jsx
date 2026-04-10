import { useEffect, useState, useRef } from "react"

/**
 * Animates a number from 0 to the target value on mount.
 * Used for score reveal on the Results page.
 */
export default function AnimatedCounter({
  value,
  duration = 800,
  decimals = 2,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const target = Number(value) || 0
    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(eased * target)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className={`score-display animate-count-up ${className}`}>
      {displayValue.toFixed(decimals)}
    </span>
  )
}
