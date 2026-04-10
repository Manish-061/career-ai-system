import { useNavigate } from "react-router-dom"
import { useCareer } from "../../context/CareerContext"
import OverviewSection from "./OverviewSection"
import ExplanationSection from "./ExplanationSection"
import GrowthSection from "./GrowthSection"
import EmptyState from "../../components/ui/EmptyState"
import Button from "../../components/ui/Button"
import PageTransition from "../../components/ui/PageTransition"
import { useState, useEffect } from "react"

export default function Results() {
  const navigate = useNavigate()
  const { profile, result, aiAssistance, aiWarning } = useCareer()
  const [activeSection, setActiveSection] = useState("")

  const goHome = () => navigate("/")

  // Scroll-spy: highlight the currently visible section in the nav bar
  useEffect(() => {
    const sectionIds = [
      "recommendation-overview",
      "recommendation-explanation",
      "recommendation-growth",
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    )

    for (const id of sectionIds) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [result])

  if (!result) {
    return (
      <PageTransition>
        <section className="mx-auto max-w-3xl py-16">
          <div className="soft-panel rounded-[32px] p-8 sm:p-10">
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
              title="No Result Available"
              description="Start an assessment to view your career recommendation. Your recommendation page appears here after the form is submitted."
              action={<Button onClick={goHome}>Go to Home</Button>}
            />
          </div>
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <section className="space-y-5 py-4">
        {/* Summary Chips */}
        <div className="soft-panel animate-fade-in-up grid auto-rows-min gap-3 rounded-[32px] p-5 sm:grid-cols-3 sm:p-6">
          <SummaryCard label="Recommended Role" value={result.role} />
          <SummaryCard label="Domain" value={result.domain} />
          <SummaryCard label="Readiness" value={result.readiness_level} />
        </div>

        {/* Sticky Navigation */}
        <nav
          className="soft-panel result-nav-panel rounded-[28px] px-4 py-3 sm:px-5"
          aria-label="Results section navigation"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Navigate
            </span>
            <NavLink
              href="#recommendation-overview"
              active={activeSection === "recommendation-overview"}
            >
              Overview
            </NavLink>
            <NavLink
              href="#recommendation-explanation"
              active={activeSection === "recommendation-explanation"}
            >
              Explanation
            </NavLink>
            <NavLink
              href="#recommendation-growth"
              active={activeSection === "recommendation-growth"}
            >
              Growth Plan
            </NavLink>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <OverviewSection
            data={result}
            profile={profile}
            aiAssistance={aiAssistance}
            aiWarning={aiWarning}
          />
          <ExplanationSection data={result} aiAssistance={aiAssistance} />
          <GrowthSection data={result} onNavigateHome={goHome} />
        </div>
      </section>
    </PageTransition>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2.5 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function NavLink({ href, children, active }) {
  return (
    <a
      href={href}
      className={`result-nav-link ${active ? "result-nav-link-active" : ""}`}
    >
      {children}
    </a>
  )
}
