# 🚀 Career AI System

An explainable, knowledge-based career recommendation system that analyzes user skills, education, and interests to provide **personalized, domain-aware career suggestions** with reasoning, skill gap analysis, and transition guidance.

---

## 📌 Overview

Choosing the right career path is a complex decision influenced by multiple factors such as skills, education, and interests. Traditional systems either provide generic suggestions or lack transparency.

This project introduces a **Career Decision Support System** that:
- Evaluates user profiles using **weighted skill scoring**
- Adapts recommendations using **domain-aware logic**
- Assesses **career readiness**
- Provides **clear explanations and improvement paths**

---

## 🧠 Key Features

- ✅ Skill Proficiency Modeling (rating + project-based scoring)
- ✅ Domain-Aware Evaluation (Technology, Commerce, Medical, Arts, Engineering)
- ✅ Career Readiness Assessment (High / Medium / Low)
- ✅ Skill Gap Analysis
- ✅ Explainable Recommendations
- ✅ Transition Path Suggestions
- ✅ Modular Backend Architecture (FastAPI)

---

## 🏗️ System Architecture

```text
User Input → Normalization → Skill Scoring → Matching Engine
→ Domain Evaluation → Reasoning Engine → Explanation → Output
```

---

## 🗂️ Project Structure

```text
career-ai-system/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   └── routes.py
│   │   │
│   │   ├── models/
│   │   │   ├── user_profile.py
│   │   │   └── response_model.py
│   │   │
│   │   ├── services/
│   │   │   ├── reasoning_engine.py
│   │   │   ├── matcher.py
│   │   │   ├── normalizer.py
│   │   │   ├── skill_gap.py
│   │   │   ├── explanation.py
│   │   │   └── domain_engine.py
│   │   │
│   │   ├── utils/
│   │   │   ├── scoring.py
│   │   │   └── helpers.py
│   │   │
│   │   ├── data/
│   │   │   └── knowledge_base.json
│   │   │
│   │   └── __init__.py
│   │
│   ├── requirements.txt
│   └── README.md
```

---

## ⚙️ Technology Stack

- **Backend:** Python, FastAPI  
- **Frontend:** React.js (planned)  
- **Communication:** REST APIs  

---

## 📊 Knowledge Base Design

The system uses a structured JSON-based knowledge base that includes:

- Domains & subdomains
- Career roles
- Skill requirements with weights
- Education constraints
- Minimum project requirements
- Role difficulty levels

---

## 🧮 Skill Scoring Formula

```text
S = (w₁ × R) + (w₂ × P)
```

Where:
- `R` = normalized user rating  
- `P` = normalized project experience  
- `w₁ + w₂ = 1`

---

## 🔍 How It Works

1. User provides:
   - Skills (with rating + projects)
   - Interests
   - Education

2. System:
   - Normalizes input
   - Computes skill scores
   - Matches with knowledge base
   - Applies domain-specific weighting
   - Calculates readiness
   - Identifies skill gaps
   - Generates explanation

3. Output:
   - **Best career recommendation**
   - Readiness level
   - Missing skills
   - Suggested improvement path

---

## 📡 API Endpoints

### 🔹 Health Check
```http
GET /
```

### 🔹 Get Recommendation
```http
POST /recommend
```

#### Sample Input
```json
{
  "skills": [
    {"name": "Python", "rating": 7, "projects": 2},
    {"name": "SQL", "rating": 6, "projects": 1}
  ],
  "interests": ["Data"],
  "education": "B.Tech"
}
```

#### Sample Output

```json
{
  "recommendation": {
    "role": "Data Analyst",
    "domain": "Technology",
    "score": 0.53,
    "matched_skills": ["Python", "SQL"],
    "missing_skills": ["Statistics", "Excel"],
    "readiness_level": "Medium",
    "explanation": "You are best suited for Data Analyst with a match score of 0.53. Your strengths include Python, SQL. You need to improve in Statistics, Excel. Your readiness level is Medium. Suggested path: Build required skills and gain experience step by step."
  }
}
```

---

## 🧩 Core Modules

| Module                | Responsibility                     |
| --------------------- | ---------------------------------- |
| `normalizer.py`       | Cleans and standardizes user input |
| `scoring.py`          | Computes skill scores              |
| `matcher.py`          | Matches user skills with roles     |
| `skill_gap.py`        | Identifies missing skills          |
| `domain_engine.py`    | Applies domain-specific weights    |
| `reasoning_engine.py` | Core decision logic                |
| `explanation.py`      | Generates human-readable output    |

---

## ▶️ Getting Started

### 1. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

---

### 2. Run Server

```bash
uvicorn app.main:app --reload
```

---

### 3. Open API Docs

```text
http://localhost:8000/docs
```

---

## ⚠️ Limitations

* Knowledge base is manually curated (not dynamic)
* No real-time job market integration
* Skill validation is partially self-reported
* Rule-based system (no ML yet)

---

## 🔮 Future Improvements

* Integration with job portals (real-time data)
* Automated skill assessment (tests/certifications)
* Machine learning-based recommendations
* Personalized learning path generation
* Full frontend implementation

---

## 🎯 Conclusion

This project demonstrates a **scalable, explainable, and domain-aware career recommendation system** that goes beyond traditional matching by incorporating:

* Skill depth evaluation
* Readiness assessment
* Transition guidance

It provides users with **actionable insights**, not just suggestions.

---

## 👨‍💻 Author

**Manish Kumar**  
B.Tech CSE (Pre-Final Year)  
Backend Developer

---
