export default function RecommendationCard({ data }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6 space-y-4">

      <h2 className="text-xl font-bold text-blue-700">
        {data.role}
      </h2>

      <p><strong>Domain:</strong> {data.domain}</p>
      <p><strong>Score:</strong> {data.score}</p>
      <p><strong>Readiness:</strong> {data.readiness_level}</p>

      <div>
        <p className="font-semibold">Matched Skills:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {data.matched_skills.map((skill, i) => (
            <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold">Missing Skills:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {data.missing_skills.map((skill, i) => (
            <span key={i} className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold">Explanation:</p>
        <p className="text-gray-700">{data.explanation}</p>
      </div>

    </div>
  )
}