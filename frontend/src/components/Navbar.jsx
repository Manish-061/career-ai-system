import { useLocation, useNavigate } from "react-router-dom"
import { useCareer } from "../context/CareerContext"
import { useState, useEffect } from "react"

const ROUTE_LABELS = {
  "/": "Home",
  "/assess": "Assessment",
  "/result": "Results",
  "/generate": "Generation Studio",
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { result } = useCareer()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const goHome = () => navigate("/")
  const goAssess = () => navigate("/assess")
  const goResult = () => navigate("/result")

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <nav
        className={`glass-panel flex items-center justify-between gap-4 rounded-[28px] px-5 py-4 sm:px-6 transition-all duration-300 ${
          scrolled ? "shadow-2xl" : ""
        }`}
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-3 text-left group"
          aria-label="Go to home page"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/30 bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 text-lg font-bold text-cyan-50 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
            CA
          </div>

          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Career AI System
            </p>
            <h1 className="text-base font-semibold text-white sm:text-lg">
              Professional Career Intelligence
            </h1>
          </div>
        </button>

        {/* ── Desktop Breadcrumb + Actions ── */}
        <div className="hidden items-center gap-4 sm:flex">
          {/* Breadcrumb */}
          {pathname !== "/" ? (
            <div className="breadcrumb mr-2">
              <button type="button" className="breadcrumb-item" onClick={goHome}>
                Home
              </button>
              {(pathname === "/generate" || pathname === "/result") && result ? (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <button type="button" className="breadcrumb-item" onClick={goAssess}>
                    Assessment
                  </button>
                </>
              ) : null}
              {pathname === "/generate" && result ? (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <button type="button" className="breadcrumb-item" onClick={goResult}>
                    Results
                  </button>
                </>
              ) : null}
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">
                {ROUTE_LABELS[pathname] || "Page"}
              </span>
            </div>
          ) : null}

          {/* Action Buttons */}
          {pathname === "/generate" ? (
            <div className="flex items-center gap-2">
              <NavButton onClick={goResult}>Results</NavButton>
              <NavButton onClick={goHome}>Home</NavButton>
            </div>
          ) : pathname === "/result" ? (
            <NavButton onClick={goHome}>Back to Home</NavButton>
          ) : pathname === "/assess" ? (
            <NavButton onClick={goHome}>Back to Home</NavButton>
          ) : (
            /* Home page — show "Start Assessment" CTA button */
            <button
              type="button"
              onClick={goAssess}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-50 transition-all duration-200 hover:from-cyan-500/30 hover:to-blue-500/25 hover:shadow-lg hover:shadow-cyan-500/15 focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
            >
              Start Assessment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          type="button"
          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {mobileOpen ? (
        <div className="animate-fade-in mt-2 rounded-2xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-2">
            <MobileNavItem onClick={goHome} active={pathname === "/"}>
              Home
            </MobileNavItem>
            <MobileNavItem onClick={goAssess} active={pathname === "/assess"}>
              Start Assessment
            </MobileNavItem>
            {result ? (
              <MobileNavItem onClick={goResult} active={pathname === "/result"}>
                Results
              </MobileNavItem>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function NavButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-cyan-200/40 hover:bg-white/14 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  )
}

function MobileNavItem({ children, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-cyan-500/15 text-cyan-200"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}
