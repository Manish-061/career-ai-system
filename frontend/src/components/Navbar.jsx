const navButtonClass =
  "rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-medium text-slate-50 transition hover:border-cyan-200/50 hover:bg-white/16"

export default function Navbar({ route, onNavigateHome, onNavigateResult }) {
  return (
    <header className="relative z-20 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="glass-panel flex items-center justify-between gap-4 rounded-[28px] px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/35 bg-cyan-200/12 text-lg font-semibold text-cyan-50">
            CA
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-300">
              Career AI System
            </p>
            <h1 className="text-lg font-semibold text-white sm:text-xl">
              Professional Career Intelligence
            </h1>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {route === "generate" ? (
            <>
              <button
                type="button"
                onClick={onNavigateResult}
                className={navButtonClass}
              >
                Back to Results
              </button>
              <button
                type="button"
                onClick={onNavigateHome}
                className={navButtonClass}
              >
                Home
              </button>
            </>
          ) : route === "result" ? (
            <button
              type="button"
              onClick={onNavigateHome}
              className={navButtonClass}
            >
              Back to Home
            </button>
          ) : (
            <span className="hidden rounded-full border border-cyan-200/18 bg-cyan-200/10 px-4 py-2 text-sm font-medium text-cyan-50 sm:inline-flex">
              Guided Assessment
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
