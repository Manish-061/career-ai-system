import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCareer } from "../../context/CareerContext"
import { getAIRecommendation, getEnhancedRecommendation } from "../../services/api"
import ProfileForm from "../Home/ProfileForm"
import PageTransition from "../../components/ui/PageTransition"

/**
 * Assessment page — the form where users fill in their profile details.
 * Separated from the landing page so the home page is purely informational.
 */
export default function Assess() {
  const navigate = useNavigate()
  const { profile, handleRecommendationReady } = useCareer()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const clearError = useCallback(() => setError(""), [])

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      setError("")

      if (formData.mode === "manual") {
        const { skills, education, interests } = formData

        const touchedSkills = skills.filter(
          (skill) =>
            skill.name.trim() !== "" || skill.rating !== "" || skill.projects !== "",
        )

        if (!education.trim()) {
          setError("Please select your education background before continuing.")
          return
        }

        if (touchedSkills.length === 0) {
          setError("Add at least one skill with a rating and project count.")
          return
        }

        const hasIncompleteSkill = touchedSkills.some(
          (skill) => !skill.name.trim() || skill.rating === "" || skill.projects === "",
        )

        if (hasIncompleteSkill) {
          setError("Complete every skill row before requesting a recommendation.")
          return
        }

        const cleanedSkills = touchedSkills.map((skill) => ({
          name: skill.name.trim(),
          rating: Number(skill.rating),
          projects: Number(skill.projects),
        }))

        const hasInvalidSkill = cleanedSkills.some(
          (skill) =>
            Number.isNaN(skill.rating) ||
            Number.isNaN(skill.projects) ||
            skill.rating < 1 ||
            skill.rating > 10 ||
            skill.projects < 0,
        )

        if (hasInvalidSkill) {
          setError("Use ratings between 1 and 10, and project counts of 0 or more.")
          return
        }

        const payload = {
          skills: cleanedSkills,
          interests: interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          education: education.trim(),
        }

        const data = await getEnhancedRecommendation(payload)
        handleRecommendationReady({
          recommendation: data.recommendation,
          submittedProfile: payload,
          aiAssistance: data.ai_assistance,
          aiWarning: data.ai_warning,
        })
        navigate("/result")
      } else {
        const { freeTextProfile } = formData

        if (!freeTextProfile.trim()) {
          setError("Describe your profile so Gemini can extract your skills and interests.")
          return
        }

        const data = await getAIRecommendation(freeTextProfile.trim())
        handleRecommendationReady({
          recommendation: data.recommendation,
          submittedProfile: data.parsed_profile,
          aiAssistance: data.ai_assistance,
          aiWarning: data.ai_warning,
        })
        navigate("/result")
      }
    } catch (err) {
      setError(err.message || "Unable to fetch your recommendation right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl py-4">
        <ProfileForm
          initialProfile={profile}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onClearError={clearError}
        />
      </section>
    </PageTransition>
  )
}
