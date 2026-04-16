"""
7 Day Unlimited Interview Access – FastAPI Backend
"""
import io, os
from datetime import datetime
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, init_db
from models import ApplyRequest, LoginRequest, SignupRequest, UpdateStatusRequest

try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import docx as python_docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

try:
    import docx as python_docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

try:
    import anthropic
    AI_SUPPORT = True
except ImportError:
    AI_SUPPORT = False

app = FastAPI(title="7 Day Interview Access API", version="2.0")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    init_db()
    print("✅ Database ready.")
    print(f"✅ AI support: {AI_SUPPORT}")

KNOWN_SKILLS = [
    "python","java","sql","html","css","c++","javascript","react",
    "django","spring","node","typescript","docker","kubernetes","redis",
    "kafka","linux","excel","tableau","go","kotlin","android","spark",
]

def extract_skills(text):
    lower = text.lower()
    return [s for s in KNOWN_SKILLS if s in lower]

def compute_match(user_skills, job_skills_csv):
    required = [s.strip().lower() for s in job_skills_csv.split(",") if s.strip()]
    matched  = sum(1 for s in user_skills if s.lower() in required)
    return matched, len(required)

# ── AUTH ──────────────────────────────────────────────────────────────────────
@app.post("/signup")
def signup(data: SignupRequest):
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (name, email, password) VALUES (?,?,?)",
            (data.name, data.email, data.password))
        conn.commit()
        user = conn.execute(
            "SELECT id, name, email, skills FROM users WHERE email=?", (data.email,)).fetchone()
        return {"success": True, "user": dict(user)}
    except:
        raise HTTPException(status_code=400, detail="Email already registered.")
    finally:
        conn.close()

@app.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    user = conn.execute(
        "SELECT id, name, email, skills FROM users WHERE email=? AND password=?",
        (data.email, data.password)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"success": True, "user": dict(user)}

# ── RESUME ────────────────────────────────────────────────────────────────────
@app.post("/upload-resume")
async def upload_resume(user_id: int = Query(...), file: UploadFile = File(...)):
    file_content = await file.read()
    raw_text     = ""
    fname        = file.filename.lower()

    # PDF extraction
    if PDF_SUPPORT and fname.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                raw_text += page.extract_text() or ""
        except:
            raw_text = ""

    # DOCX extraction
    elif DOCX_SUPPORT and fname.endswith(".docx"):
        try:
            doc = python_docx.Document(io.BytesIO(file_content))
            raw_text = " ".join([para.text for para in doc.paragraphs])
        except:
            raw_text = ""

    # DOC (old Word format) — extract as plain text
    elif fname.endswith(".doc"):
        try:
            raw_text = file_content.decode("utf-8", errors="ignore")
        except:
            raw_text = ""

    found = extract_skills(raw_text) or ["python","sql"]
    conn  = get_db()
    conn.execute("UPDATE users SET skills=?, resume_text=? WHERE id=?",
        (",".join(found), raw_text[:5000], user_id))
    conn.commit()
    conn.close()
    fmt = "PDF" if fname.endswith(".pdf") else "Word document" if fname.endswith((".docx",".doc")) else "file"
    return {"success": True, "skills": found, "message": f"Extracted {len(found)} skill(s) from your {fmt}."}

# ── AI RESUME FIT CHECK ───────────────────────────────────────────────────────
@app.get("/check-resume-fit")
def check_resume_fit(user_id: int = Query(...), job_id: int = Query(...)):
    conn = get_db()
    user = conn.execute("SELECT name, skills, resume_text FROM users WHERE id=?", (user_id,)).fetchone()
    job  = conn.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
    conn.close()

    if not user or not job:
        raise HTTPException(status_code=404, detail="User or job not found.")

    skills     = user["skills"] or ""
    resume_txt = user["resume_text"] or ""

    # Build context for AI
    resume_context = resume_txt[:2000] if resume_txt else f"Skills listed: {skills}"

    if not AI_SUPPORT:
        # Fallback: basic skill matching
        user_skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        req_skills      = [s.strip().lower() for s in job["skills_required"].split(",") if s.strip()]
        matched = [s for s in user_skill_list if s in req_skills]
        missing = [s for s in req_skills if s not in user_skill_list]
        score   = int((len(matched)/len(req_skills))*100) if req_skills else 0
        return {
            "score": score,
            "verdict": "Strong Match" if score>=70 else "Moderate Match" if score>=40 else "Low Match",
            "matched_skills": matched,
            "missing_skills": missing,
            "strengths": [f"You have {len(matched)} of {len(req_skills)} required skills"],
            "gaps": [f"Consider learning: {', '.join(missing)}"] if missing else [],
            "recommendation": f"Your profile matches {score}% of the job requirements.",
            "tip": "Upload your resume for a more detailed AI analysis.",
        }

    # Use Claude AI
    try:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY",""))

        prompt = f"""You are an expert HR consultant and technical recruiter. Analyse how well this candidate's profile fits the job.

CANDIDATE PROFILE:
Name: {user["name"]}
Skills: {skills}
Resume excerpt: {resume_context}

JOB DETAILS:
Company: {job["company"]}
Role: {job["role"]}
Required Skills: {job["skills_required"]}
Job Description: {job["job_description"] or "Not provided"}
Qualifications: {job["qualifications"] or "Not provided"}

Provide a concise analysis in this EXACT JSON format (no extra text):
{{
  "score": <number 0-100>,
  "verdict": "<one of: Strong Match, Good Match, Moderate Match, Low Match>",
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength 1 in one sentence", "strength 2"],
  "gaps": ["gap 1 in one sentence", "gap 2"],
  "recommendation": "<2-3 sentence honest recommendation>",
  "tip": "<one actionable tip to improve fit>"
}}"""

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=800,
            messages=[{"role":"user","content":prompt}]
        )

        import json, re
        text = message.content[0].text.strip()
        # Extract JSON from response
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            result = json.loads(match.group())
            return result
        raise ValueError("No JSON found")

    except Exception as e:
        # Fallback if AI fails
        user_skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        req_skills      = [s.strip().lower() for s in job["skills_required"].split(",") if s.strip()]
        matched = [s for s in user_skill_list if s in req_skills]
        missing = [s for s in req_skills if s not in user_skill_list]
        score   = int((len(matched)/len(req_skills))*100) if req_skills else 0
        return {
            "score": score,
            "verdict": "Strong Match" if score>=70 else "Moderate Match" if score>=40 else "Low Match",
            "matched_skills": matched,
            "missing_skills": missing,
            "strengths": [f"You have {len(matched)} of {len(req_skills)} required skills"],
            "gaps": [f"Consider learning: {', '.join(missing)}"] if missing else [],
            "recommendation": f"Your profile matches {score}% of the job requirements.",
            "tip": "Set ANTHROPIC_API_KEY for detailed AI analysis.",
        }

# ── JOBS ──────────────────────────────────────────────────────────────────────
@app.get("/jobs")
def get_jobs(user_id: int=Query(None), location: str=Query(None), role: str=Query(None)):
    conn = get_db()
    query  = "SELECT * FROM jobs WHERE 1=1"
    params = []
    if location and location.lower()!="all":
        query += " AND LOWER(location)=LOWER(?)"
        params.append(location)
    if role and role.lower()!="all":
        query += " AND LOWER(role) LIKE LOWER(?)"
        params.append(f"%{role}%")
    jobs = conn.execute(query, params).fetchall()
    user_skills = []
    if user_id:
        row = conn.execute("SELECT skills FROM users WHERE id=?", (user_id,)).fetchone()
        if row and row["skills"]:
            user_skills = [s.strip() for s in row["skills"].split(",") if s.strip()]
    conn.close()
    result = []
    for job in jobs:
        matched, total = compute_match(user_skills, job["skills_required"])
        pct = round((matched/total)*100) if total else 0
        result.append({
            "id":job["id"], "company":job["company"], "role":job["role"],
            "skills_required":job["skills_required"], "location":job["location"],
            "location_url": job["location_url"] or "",
            "location_desc": job["location_desc"] or "",
            "date":job["date"], "walkin_time":job["walkin_time"],
            "avg_salary":job["avg_salary"],
            "company_about":job["company_about"] or "",
            "job_description":job["job_description"] or "",
            "responsibilities":job["responsibilities"] or "",
            "qualifications":job["qualifications"] or "",
            "interview_steps":job["interview_steps"] or "",
            "match_score":matched, "match_percent":pct,
        })
    result.sort(key=lambda x: x["match_score"], reverse=True)
    return result

# ── APPLY ─────────────────────────────────────────────────────────────────────
@app.post("/apply")
def apply_job(data: ApplyRequest):
    conn = get_db()
    existing = conn.execute(
        "SELECT id FROM applications WHERE user_id=? AND job_id=?",
        (data.user_id, data.job_id)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="You have already applied to this job.")
    conn.execute(
        "INSERT INTO applications (user_id,job_id,status,applied_at) VALUES (?,?,'applied',?)",
        (data.user_id, data.job_id, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Applied successfully! Good luck! 🎯"}

@app.get("/my-applications")
def my_applications(user_id: int=Query(...)):
    conn = get_db()
    rows = conn.execute("""
        SELECT a.id as app_id, a.status, a.applied_at,
               j.id as job_id, j.company, j.role, j.skills_required,
               j.location, j.date
        FROM applications a JOIN jobs j ON a.job_id=j.id
        WHERE a.user_id=? ORDER BY a.applied_at DESC
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.put("/application/{app_id}/status")
def update_status(app_id: int, body: UpdateStatusRequest):
    allowed = {"applied","attended","cancelled"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
    conn = get_db()
    conn.execute("UPDATE applications SET status=? WHERE id=?", (body.status, app_id))
    conn.commit()
    conn.close()
    return {"success": True, "status": body.status}

# ── ADMIN ─────────────────────────────────────────────────────────────────────
ADMIN_EMAIL    = "admin@interview.com"
ADMIN_PASSWORD = "admin123"

@app.post("/admin/login")
def admin_login(data: LoginRequest):
    if data.email!=ADMIN_EMAIL or data.password!=ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")
    return {"success":True, "admin":{"email":ADMIN_EMAIL,"name":"Admin"}}

@app.get("/admin/jobs")
def admin_get_jobs():
    conn = get_db()
    jobs = conn.execute("SELECT * FROM jobs ORDER BY date ASC").fetchall()
    conn.close()
    return [dict(j) for j in jobs]

@app.post("/admin/jobs")
def admin_add_job(job: dict):
    conn = get_db()
    conn.execute("""
        INSERT INTO jobs (company,role,skills_required,location,location_url,location_desc,
            date,walkin_time,avg_salary,company_about,job_description,
            responsibilities,qualifications,interview_steps)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (job["company"],job["role"],job["skills_required"],job["location"],
          job.get("location_url",""),job.get("location_desc",""),
          job["date"],job.get("walkin_time","10:00 AM - 4:00 PM"),
          job.get("avg_salary","5-10 LPA"),
          job.get("company_about",""),job.get("job_description",""),
          job.get("responsibilities",""),job.get("qualifications",""),
          job.get("interview_steps","")))
    conn.commit(); conn.close()
    return {"success":True,"message":"Job added."}

@app.put("/admin/jobs/{job_id}")
def admin_update_job(job_id: int, job: dict):
    conn = get_db()
    conn.execute("""
        UPDATE jobs SET company=?,role=?,skills_required=?,location=?,
            location_url=?,location_desc=?,date=?,walkin_time=?,avg_salary=?,
            company_about=?,job_description=?,responsibilities=?,
            qualifications=?,interview_steps=? WHERE id=?
    """, (job["company"],job["role"],job["skills_required"],job["location"],
          job.get("location_url",""),job.get("location_desc",""),
          job["date"],job.get("walkin_time","10:00 AM - 4:00 PM"),
          job.get("avg_salary","5-10 LPA"),
          job.get("company_about",""),job.get("job_description",""),
          job.get("responsibilities",""),job.get("qualifications",""),
          job.get("interview_steps",""),job_id))
    conn.commit(); conn.close()
    return {"success":True,"message":"Job updated."}

@app.delete("/admin/jobs/{job_id}")
def admin_delete_job(job_id: int):
    conn = get_db()
    conn.execute("DELETE FROM jobs WHERE id=?", (job_id,))
    conn.execute("DELETE FROM applications WHERE job_id=?", (job_id,))
    conn.commit(); conn.close()
    return {"success":True}

@app.get("/admin/users")
def admin_get_users():
    conn = get_db()
    users = conn.execute("SELECT id,name,email,skills FROM users ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(u) for u in users]

@app.get("/admin/applications")
def admin_get_applications():
    conn = get_db()
    rows = conn.execute("""
        SELECT a.id,a.status,a.applied_at,
               u.name as user_name,u.email as user_email,
               j.company,j.role,j.location,j.date
        FROM applications a
        JOIN users u ON a.user_id=u.id
        JOIN jobs  j ON a.job_id=j.id
        ORDER BY a.applied_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]
