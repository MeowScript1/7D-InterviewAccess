"""
7 Day Unlimited Interview Access – FastAPI Backend (Supabase/PostgreSQL)
"""
import io, os, json, re
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
    cur  = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id, name, email, skills",
            (data.name, data.email, data.password)
        )
        user = dict(cur.fetchone())
        conn.commit()
        return {"success": True, "user": user}
    except Exception:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email already registered.")
    finally:
        cur.close()
        conn.close()

@app.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute(
        "SELECT id, name, email, skills FROM users WHERE email=%s AND password=%s",
        (data.email, data.password)
    )
    user = cur.fetchone()
    cur.close()
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

    if PDF_SUPPORT and fname.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                raw_text += page.extract_text() or ""
        except:
            raw_text = ""
    elif DOCX_SUPPORT and fname.endswith(".docx"):
        try:
            doc = python_docx.Document(io.BytesIO(file_content))
            raw_text = " ".join([para.text for para in doc.paragraphs])
        except:
            raw_text = ""
    elif fname.endswith(".doc"):
        try:
            raw_text = file_content.decode("utf-8", errors="ignore")
        except:
            raw_text = ""

    found = extract_skills(raw_text) or ["python", "sql"]
    conn  = get_db()
    cur   = conn.cursor()
    cur.execute("UPDATE users SET skills=%s, resume_text=%s WHERE id=%s",
        (",".join(found), raw_text[:5000], user_id))
    conn.commit()
    cur.close()
    conn.close()
    fmt = "PDF" if fname.endswith(".pdf") else "Word document" if fname.endswith((".docx",".doc")) else "file"
    return {"success": True, "skills": found, "message": f"Extracted {len(found)} skill(s) from your {fmt}."}

# ── AI RESUME FIT CHECK ───────────────────────────────────────────────────────
@app.get("/check-resume-fit")
def check_resume_fit(user_id: int = Query(...), job_id: int = Query(...)):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT name, skills, resume_text FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.execute("SELECT * FROM jobs WHERE id=%s", (job_id,))
    job  = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not job:
        raise HTTPException(status_code=404, detail="User or job not found.")

    user     = dict(user)
    job      = dict(job)
    skills   = user.get("skills") or ""
    res_text = user.get("resume_text") or ""
    resume_context = res_text[:2000] if res_text else f"Skills listed: {skills}"

    if not AI_SUPPORT:
        user_skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        req_skills      = [s.strip().lower() for s in job["skills_required"].split(",") if s.strip()]
        matched = [s for s in user_skill_list if s in req_skills]
        missing = [s for s in req_skills if s not in user_skill_list]
        score   = int((len(matched)/len(req_skills))*100) if req_skills else 0
        return {
            "score": score,
            "verdict": "Strong Match" if score>=70 else "Moderate Match" if score>=40 else "Low Match",
            "matched_skills": matched, "missing_skills": missing,
            "strengths": [f"You have {len(matched)} of {len(req_skills)} required skills"],
            "gaps": [f"Consider learning: {', '.join(missing)}"] if missing else [],
            "recommendation": f"Your profile matches {score}% of the job requirements.",
            "tip": "Set ANTHROPIC_API_KEY for detailed AI analysis.",
        }

    try:
        client  = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY",""))
        prompt  = f"""You are an expert HR consultant. Analyse how well this candidate fits the job.

CANDIDATE: Name: {user['name']}, Skills: {skills}
Resume: {resume_context}

JOB: Company: {job['company']}, Role: {job['role']}
Required Skills: {job['skills_required']}
Description: {job.get('job_description','')[:500]}

Respond ONLY with this JSON (no extra text):
{{"score":<0-100>,"verdict":"<Strong Match|Good Match|Moderate Match|Low Match>","matched_skills":[],"missing_skills":[],"strengths":[],"gaps":[],"recommendation":"<2-3 sentences>","tip":"<one actionable tip>"}}"""

        message = client.messages.create(
            model="claude-haiku-4-5-20251001", max_tokens=800,
            messages=[{"role":"user","content":prompt}]
        )
        text  = message.content[0].text.strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("No JSON")
    except Exception:
        user_skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        req_skills      = [s.strip().lower() for s in job["skills_required"].split(",") if s.strip()]
        matched = [s for s in user_skill_list if s in req_skills]
        missing = [s for s in req_skills if s not in user_skill_list]
        score   = int((len(matched)/len(req_skills))*100) if req_skills else 0
        return {
            "score": score,
            "verdict": "Strong Match" if score>=70 else "Moderate Match" if score>=40 else "Low Match",
            "matched_skills": matched, "missing_skills": missing,
            "strengths": [f"You have {len(matched)} of {len(req_skills)} required skills"],
            "gaps": [f"Consider learning: {', '.join(missing)}"] if missing else [],
            "recommendation": f"Your profile matches {score}% of the job requirements.",
            "tip": "Upload your full resume for a more detailed analysis.",
        }

# ── JOBS ──────────────────────────────────────────────────────────────────────
@app.get("/jobs")
def get_jobs(user_id: int=Query(None), location: str=Query(None), role: str=Query(None)):
    conn   = get_db()
    cur    = conn.cursor()
    query  = "SELECT * FROM jobs WHERE 1=1"
    params = []
    if location and location.lower() != "all":
        query += " AND LOWER(location)=LOWER(%s)"
        params.append(location)
    if role and role.lower() != "all":
        query += " AND LOWER(role) LIKE LOWER(%s)"
        params.append(f"%{role}%")
    cur.execute(query, params)
    jobs = [dict(r) for r in cur.fetchall()]

    user_skills = []
    if user_id:
        cur.execute("SELECT skills FROM users WHERE id=%s", (user_id,))
        row = cur.fetchone()
        if row and row["skills"]:
            user_skills = [s.strip() for s in row["skills"].split(",") if s.strip()]
    cur.close()
    conn.close()

    result = []
    for job in jobs:
        matched, total = compute_match(user_skills, job["skills_required"])
        pct = round((matched/total)*100) if total else 0
        result.append({
            **job,
            "location_url":  job.get("location_url") or "",
            "location_desc": job.get("location_desc") or "",
            "match_score":   matched,
            "match_percent": pct,
        })
    result.sort(key=lambda x: x["match_score"], reverse=True)
    return result

# ── APPLY ─────────────────────────────────────────────────────────────────────
@app.post("/apply")
def apply_job(data: ApplyRequest):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM applications WHERE user_id=%s AND job_id=%s",
        (data.user_id, data.job_id))
    if cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(status_code=400, detail="You have already applied to this job.")
    cur.execute(
        "INSERT INTO applications (user_id,job_id,status,applied_at) VALUES (%s,%s,'applied',%s)",
        (data.user_id, data.job_id, datetime.now().isoformat()))
    conn.commit()
    cur.close(); conn.close()
    return {"success": True, "message": "Applied successfully! Good luck! 🎯"}

@app.get("/my-applications")
def my_applications(user_id: int=Query(...)):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("""
        SELECT a.id as app_id, a.status, a.applied_at,
               j.id as job_id, j.company, j.role, j.skills_required,
               j.location, j.date
        FROM applications a JOIN jobs j ON a.job_id=j.id
        WHERE a.user_id=%s ORDER BY a.applied_at DESC
    """, (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    cur.close(); conn.close()
    return rows

@app.put("/application/{app_id}/status")
def update_status(app_id: int, body: UpdateStatusRequest):
    allowed = {"applied","attended","cancelled"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("UPDATE applications SET status=%s WHERE id=%s", (body.status, app_id))
    conn.commit()
    cur.close(); conn.close()
    return {"success": True, "status": body.status}

# ── ADMIN ─────────────────────────────────────────────────────────────────────
ADMIN_EMAIL    = "admin@interview.com"
ADMIN_PASSWORD = "admin123"

@app.post("/admin/login")
def admin_login(data: LoginRequest):
    if data.email != ADMIN_EMAIL or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")
    return {"success": True, "admin": {"email": ADMIN_EMAIL, "name": "Admin"}}

@app.get("/admin/jobs")
def admin_get_jobs():
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT * FROM jobs ORDER BY date ASC")
    jobs = [dict(r) for r in cur.fetchall()]
    cur.close(); conn.close()
    return jobs

@app.post("/admin/jobs")
def admin_add_job(job: dict):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("""
        INSERT INTO jobs (company,role,skills_required,location,location_url,location_desc,
            date,walkin_time,avg_salary,company_about,job_description,
            responsibilities,qualifications,interview_steps)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (job["company"],job["role"],job["skills_required"],job["location"],
          job.get("location_url",""),job.get("location_desc",""),
          job["date"],job.get("walkin_time","10:00 AM - 4:00 PM"),
          job.get("avg_salary","5-10 LPA"),
          job.get("company_about",""),job.get("job_description",""),
          job.get("responsibilities",""),job.get("qualifications",""),
          job.get("interview_steps","")))
    conn.commit(); cur.close(); conn.close()
    return {"success": True, "message": "Job added."}

@app.put("/admin/jobs/{job_id}")
def admin_update_job(job_id: int, job: dict):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("""
        UPDATE jobs SET company=%s,role=%s,skills_required=%s,location=%s,
            location_url=%s,location_desc=%s,date=%s,walkin_time=%s,avg_salary=%s,
            company_about=%s,job_description=%s,responsibilities=%s,
            qualifications=%s,interview_steps=%s WHERE id=%s
    """, (job["company"],job["role"],job["skills_required"],job["location"],
          job.get("location_url",""),job.get("location_desc",""),
          job["date"],job.get("walkin_time","10:00 AM - 4:00 PM"),
          job.get("avg_salary","5-10 LPA"),
          job.get("company_about",""),job.get("job_description",""),
          job.get("responsibilities",""),job.get("qualifications",""),
          job.get("interview_steps",""),job_id))
    conn.commit(); cur.close(); conn.close()
    return {"success": True, "message": "Job updated."}

@app.delete("/admin/jobs/{job_id}")
def admin_delete_job(job_id: int):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("DELETE FROM applications WHERE job_id=%s", (job_id,))
    cur.execute("DELETE FROM jobs WHERE id=%s", (job_id,))
    conn.commit(); cur.close(); conn.close()
    return {"success": True}

@app.get("/admin/users")
def admin_get_users():
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id, name, email, skills FROM users ORDER BY id DESC")
    users = [dict(u) for u in cur.fetchall()]
    cur.close(); conn.close()
    return users

@app.get("/admin/applications")
def admin_get_applications():
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("""
        SELECT a.id, a.status, a.applied_at,
               u.name as user_name, u.email as user_email,
               j.company, j.role, j.location, j.date
        FROM applications a
        JOIN users u ON a.user_id=u.id
        JOIN jobs  j ON a.job_id=j.id
        ORDER BY a.applied_at DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close(); conn.close()
    return rows