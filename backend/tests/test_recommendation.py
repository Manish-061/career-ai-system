import unittest

from app.models.user_profile import SkillInput, UserProfile
from app.services.reasoning_engine import generate_recommendations


class RecommendationEngineTests(unittest.TestCase):
    def test_python_only_with_data_interest_prefers_data_analyst(self):
        profile = UserProfile(
            skills=[SkillInput(name="Python", rating=8, projects=1)],
            interests=["data analyst role"],
            education="B.Tech",
        )

        recommendation = generate_recommendations(profile)["recommendation"]

        self.assertEqual(recommendation["role"], "Data Analyst")
        self.assertIn("Python", recommendation["matched_skills"])
        self.assertIn("SQL", recommendation["missing_skills"])
        self.assertIn("data analyst role", recommendation["matched_interests"])

    def test_reporting_stack_prefers_bi_analyst(self):
        profile = UserProfile(
            skills=[
                SkillInput(name="SQL", rating=8, projects=2),
                SkillInput(name="Excel", rating=9, projects=2),
                SkillInput(name="Power BI", rating=7, projects=1),
            ],
            interests=["business intelligence", "analytics"],
            education="BSc",
        )

        recommendation = generate_recommendations(profile)["recommendation"]

        self.assertEqual(recommendation["role"], "Business Intelligence Analyst")
        self.assertEqual(recommendation["recommendation_type"], "Strong Fit")
        self.assertIn("Power BI", recommendation["matched_skills"])

    def test_ml_profile_prefers_ml_engineer(self):
        profile = UserProfile(
            skills=[
                SkillInput(name="Python", rating=9, projects=3),
                SkillInput(name="Machine Learning", rating=8, projects=2),
                SkillInput(name="SQL", rating=6, projects=1),
            ],
            interests=["machine learning", "ai"],
            education="B.Tech",
        )

        recommendation = generate_recommendations(profile)["recommendation"]

        self.assertEqual(recommendation["role"], "Machine Learning Engineer")
        self.assertIn("MLOps", recommendation["missing_skills"])
        self.assertGreaterEqual(recommendation["score"], 0.7)


if __name__ == "__main__":
    unittest.main()
