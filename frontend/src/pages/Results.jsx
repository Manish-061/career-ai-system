import RecommendationCard from "../components/RecommendationCard"

export default function Results({
  profile,
  result,
  aiAssistance,
  aiWarning,
  onNavigateHome,
  onLaunchGeneration,
}) {
  if (!result) {
    return (
      <section className="mx-auto max-w-3xl py-16">
        <div className="soft-panel rounded-[32px] p-8 text-center sm:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            No Result Available
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            Start an assessment to view your recommendation.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Your recommendation page appears here after the form is submitted.
          </p>

          <button
            type="button"
            onClick={onNavigateHome}
            className="primary-button mt-8"
          >
            Go to Home
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5 py-4">
      <div className="soft-panel grid auto-rows-min gap-3 rounded-[32px] p-5 sm:grid-cols-3 sm:p-6">
        <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Recommended Role</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {result.role}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Domain</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {result.domain}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Readiness</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {result.readiness_level}
          </p>
        </div>
      </div>

      <div className="soft-panel result-nav-panel rounded-[28px] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Navigate
          </span>
          <a href="#recommendation-overview" className="result-nav-link">
            Overview
          </a>
          <a href="#recommendation-explanation" className="result-nav-link">
            Explanation
          </a>
          <a href="#recommendation-growth" className="result-nav-link">
            Growth Plan
          </a>
        </div>
      </div>

      <RecommendationCard
        data={result}
        profile={profile}
        aiAssistance={aiAssistance}
        aiWarning={aiWarning}
        onNavigateHome={onNavigateHome}
        onLaunchGeneration={onLaunchGeneration}
      />
    </section>
  )
}
