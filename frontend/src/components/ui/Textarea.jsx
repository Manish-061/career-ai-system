/**
 * Auto-height textarea with optional character count.
 */
export default function Textarea({
  label,
  id,
  compact = false,
  showCount = false,
  maxLength,
  value = "",
  className = "",
  ...props
}) {
  return (
    <div className="field-group">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="field-label" htmlFor={id}>
            {label}
          </label>
          {showCount ? (
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {value.length}{maxLength ? `/${maxLength}` : ""}
            </span>
          ) : null}
        </div>
      ) : null}
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        className={`field-input ${compact ? "field-input-compact" : ""} resize-none ${className}`}
        {...props}
      />
    </div>
  )
}
