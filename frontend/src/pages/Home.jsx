import { useState } from "react"
import SkillList from "../components/SkillList"
import RecommendationCard from "../components/RecommendationCard"
import Loader from "../components/Loader"
import { getRecommendation } from "../services/api"

export default function Home() {

  const [skills, setSkills] = useState([
    { name: "", rating: "", projects: "" }
  ])

  const [education, setEducation] = useState("")
  const [interests, setInterests] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const payload = {
        skills,
        interests: interests.split(",").map(i => i.trim()),
        education
      }

      const data = await getRecommendation(payload)
      setResult(data.recommendation)

    } catch (err) {
      alert(console.log(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">

      <h1 className="text-3xl font-bold text-center mb-6">
        Career Support System
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">

        <input
          type="text"
          placeholder="Education (e.g., B.Tech)"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Interests (comma separated)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <SkillList skills={skills} setSkills={setSkills} />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Get Recommendation
        </button>

      </div>

      {loading && <Loader />}

      {result && <RecommendationCard data={result} />}

    </div>
  )
}