/**
 * Wraps page content with a CSS entrance animation (fadeInUp).
 */
export default function PageTransition({ children, className = "" }) {
  return (
    <div className={`page-transition-enter ${className}`}>
      {children}
    </div>
  )
}
