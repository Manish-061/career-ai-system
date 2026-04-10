import Textarea from "../../components/ui/Textarea"

/**
 * AI/Gemini input form — free text profile description.
 * Pure presentation component.
 */
export default function AIForm({ freeTextProfile, setFreeTextProfile }) {
  return (
    <>
      <div className="animate-fade-in rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(199 89% 48%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-sm leading-6 text-cyan-950">
            Gemini will extract skills, interests, education, and likely gaps
            from your description. If the live model is temporarily unavailable,
            the backup parser will still structure the profile as far as possible.
          </p>
        </div>
      </div>

      <Textarea
        id="profileText"
        label="Describe Your Profile"
        rows="8"
        showCount
        placeholder="Example: I am a B.Tech student, comfortable with Python and SQL, built one dashboard project, and I want to move into data analyst roles."
        value={freeTextProfile}
        onChange={(e) => setFreeTextProfile(e.target.value)}
        compact
        className="min-h-[14rem]"
      />
    </>
  )
}
