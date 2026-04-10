/**
 * Left-side dark glass panel with hero text and step cards.
 * Extracted from Home.jsx for cleaner separation.
 */
export default function HeroPanel() {
  return (
    <div className="glass-panel home-panel home-panel-dark rounded-[32px] p-6 sm:p-8">
      <div>
        <p className="animate-fade-in-up text-sm uppercase tracking-[0.28em] text-cyan-200">
          Career Planning Workspace
        </p>
        <h2 className="home-hero-title animate-fade-in-up delay-1 mt-3 max-w-xl font-semibold tracking-tight text-white">
          Build a clear career path with AI-powered insights.
        </h2>
        <p className="animate-fade-in-up delay-2 mt-4 max-w-2xl text-[0.95rem] leading-7 text-slate-300">
          Use structured input for precision, or let Gemini interpret your profile.
          The recommendation engine scores the fit, and the AI layer helps you
          explore the next move with less friction.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className={`metric-card metric-card-compact animate-fade-in-up delay-${i + 3}`}
          >
            <span className="metric-kicker">
              <StepIcon index={i} />
              Step {i + 1}
            </span>
            <h3 className="metric-title">{step.title}</h3>
            <p className="metric-copy">{step.copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: "Profile Input",
    copy: "Enter structured details or describe your background in natural language.",
  },
  {
    title: "Hybrid Reasoning",
    copy: "Rules score the fit, while Gemini supports parsing and deeper guidance.",
  },
  {
    title: "Interactive Output",
    copy: "Review the result, inspect the gaps, and open the AI studio when needed.",
  },
]

function StepIcon({ index }) {
  const icons = [
    // User/profile icon
    <svg key="0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>,
    // Brain/AI icon
    <svg key="1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 2 2.83V12a8 8 0 0 1-16 0V9.83A3 3 0 0 1 4 7V6a4 4 0 0 1 4-4" />
    </svg>,
    // Chart icon
    <svg key="2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>,
  ]
  return icons[index] || null
}
