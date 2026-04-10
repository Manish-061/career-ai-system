/**
 * Status badge/pill component for score status indication.
 */

const VARIANT_CLASSES = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-100/60",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/60",
  danger:
    "border-rose-200 bg-rose-50 text-rose-700 shadow-rose-100/60",
  info:
    "border-sky-200 bg-sky-50 text-sky-700 shadow-sky-100/60",
  neutral:
    "border-slate-200 bg-slate-50 text-slate-600",
}

export default function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
