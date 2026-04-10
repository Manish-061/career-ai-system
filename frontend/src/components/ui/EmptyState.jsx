/**
 * Illustrated empty state with icon, title, description, and optional CTA.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={`empty-state ${className}`}>
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h2 className="empty-state-title">{title}</h2>
      {description ? <p className="empty-state-copy">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
