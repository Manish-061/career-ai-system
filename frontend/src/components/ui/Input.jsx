/**
 * Styled text input with label integration and compact variant.
 */
export default function Input({
  label,
  id,
  compact = false,
  className = "",
  ...props
}) {
  return (
    <div className="field-group">
      {label ? (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={`field-input ${compact ? "field-input-compact" : ""} ${className}`}
        {...props}
      />
    </div>
  )
}
