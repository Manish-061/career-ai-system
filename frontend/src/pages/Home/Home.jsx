import { useNavigate } from "react-router-dom"
import PageTransition from "../../components/ui/PageTransition"
import Button from "../../components/ui/Button"

/**
 * Landing page — full-width hero telling users about the system.
 * The form is now on a separate /assess route.
 */
export default function Home() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <section className="landing-shell">
        {/* ── Hero Section ── */}
        <div className="glass-panel rounded-[32px] p-8 sm:p-12 lg:p-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="animate-fade-in-up text-sm uppercase tracking-[0.32em] text-cyan-200">
              AI-Powered Career Intelligence
            </p>
            <h2 className="animate-fade-in-up delay-1 mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.1 }}>
              Build a clear career path with AI-powered insights.
            </h2>
            <p className="animate-fade-in-up delay-2 mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Use structured input for precision, or let AI interpret your profile.
              The recommendation engine scores the fit, and the AI layer helps you
              explore the next move with less friction.
            </p>

            <div className="animate-fade-in-up delay-3 mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                onClick={() => navigate("/assess")}
                className="!px-8 !py-3.5 !text-base"
              >
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/14 hover:text-white"
              >
                Learn How It Works
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <div id="how-it-works" className="mt-8 scroll-mt-24">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">How It Works</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Three simple steps to your career recommendation
            </h3>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={`soft-panel rounded-[28px] p-6 sm:p-7 animate-fade-in-up delay-${i + 3}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 text-cyan-600">
                  <StepIcon index={i} />
                </div>
                <span className="mt-4 block text-xs font-bold uppercase tracking-[0.22em] text-cyan-600">
                  Step {i + 1}
                </span>
                <h4 className="mt-1.5 text-lg font-bold text-slate-900">{step.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`soft-panel rounded-[28px] p-6 sm:p-7 animate-fade-in-up delay-${i + 2}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/12 to-blue-500/8 text-cyan-600">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{feature.title}</h4>
                  <p className="mt-1.5 text-sm leading-7 text-slate-500">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div className="mt-8 glass-panel rounded-[32px] p-8 sm:p-10 text-center animate-fade-in-up delay-4">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to find your ideal career path?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
            Get a personalized recommendation based on your skills, education, and interests —
            plus a detailed roadmap to get there.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/assess")}
            className="mt-6 !px-8 !py-3.5 !text-base"
          >
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Button>
        </div>
      </section>
    </PageTransition>
  )
}

const STEPS = [
  {
    title: "Profile Input",
    copy: "Enter your education, interests, and skills using structured fields — or describe your background in natural language and let AI handle the rest.",
  },
  {
    title: "Hybrid Reasoning",
    copy: "A rule-based engine scores the fit, while AI supports intelligent parsing and provides deeper career guidance.",
  },
  {
    title: "Interactive Output",
    copy: "Review your recommendation, inspect skill gaps, and open the AI studio to generate roadmaps, project ideas, or career alternatives.",
  },
]

const FEATURES = [
  {
    title: "Dual Input Modes",
    desc: "Choose manual structured input for precision scoring, or paste your entire background in one message and let AI extract the details.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "AI Career Studio",
    desc: "Generate career roadmaps, portfolio project ideas, and alternative role comparisons with editable, regeneratable AI output.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: "Skill Gap Analysis",
    desc: "See exactly which skills you're missing and get targeted recommendations for each gap — with actionable next steps.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Guidance",
    desc: "Get confidence summaries, clarification questions, and AI-generated explanations powered by AI.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
]

function StepIcon({ index }) {
  const icons = [
    <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>,
    <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>,
  ]
  return icons[index] || null
}
