# 7 Day Unlimited Interview Access

A full-stack web app that gives users **unlimited walk-in interview access for 7 days** based on their skills.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS      |
| Backend  | FastAPI (Python)                    |
| Database | SQLite (file-based, zero config)    |

---

## Project Structure

```
interview-app/
├── backend/
│   ├── main.py          ← All API routes
│   ├── models.py        ← Pydantic request schemas
│   ├── database.py      ← SQLite setup + job seeding
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx         ← Router + Auth Context
        ├── index.css       ← Tailwind + global styles
        ├── components/
        │   ├── Navbar.jsx
        │   └── JobCard.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── MyInterviews.jsx
            └── ResumeUpload.jsx
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

---

### Step 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (auto-creates interviews.db and seeds 20 jobs)
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs (Swagger UI): http://localhost:8000/docs

---

### Step 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Reference

| Method | Endpoint                       | Description                          |
|--------|--------------------------------|--------------------------------------|
| POST   | /signup                        | Register a new user                  |
| POST   | /login                         | Login with email & password          |
| POST   | /upload-resume?user_id=1       | Upload PDF, extract skills           |
| GET    | /jobs?user_id=1&location=...   | Get all jobs sorted by skill match   |
| POST   | /apply                         | Apply to a walk-in interview         |
| GET    | /my-applications?user_id=1     | List all user's applications         |
| PUT    | /application/{id}/status       | Update status (applied/attended)     |

---

## Features

- **Skill-based matching** — upload your resume, see % match per job
- **Top Matches section** — jobs with 50%+ match highlighted separately
- **Unlimited applications** — no cap on how many you can apply to
- **Status tracking** — mark interviews as Attended or Cancelled
- **Filters** — filter by city and role keyword
- **Drag & drop resume upload**

---

## Notes

- Passwords are stored in plain text (demo only — use bcrypt in production)
- PDF skill extraction uses PyPDF2; if the PDF is scanned/image-based, fallback skills are assigned
- SQLite db file (`interviews.db`) is auto-created on first run
- 20 walk-in jobs are seeded spread across the next 7 days
