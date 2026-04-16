import React from 'react'

// Generate a realistic JD based on role + company
function generateJD(job) {
  const skills = job.skills_required.split(',').map(s => s.trim())

  const descriptions = {
    'Python Developer':      `We are looking for a skilled Python Developer to join our engineering team. You will design, build, and maintain efficient, reusable, and reliable Python code. You will work closely with product and design teams to deliver scalable backend services.`,
    'Backend Engineer':      `As a Backend Engineer, you will be responsible for building and scaling our core services. You will design RESTful APIs, optimize database queries, and collaborate with frontend teams to ship features that serve millions of users.`,
    'Frontend Developer':    `We are hiring a Frontend Developer to build responsive, accessible, and beautiful user interfaces. You will work with designers to translate mockups into pixel-perfect components and ensure a seamless user experience.`,
    'Full Stack Developer':  `As a Full Stack Developer, you will own features end-to-end — from database schema design to frontend components. You'll work in an agile environment and ship high-quality code regularly.`,
    'Java Developer':        `We are looking for a Java Developer with experience in building enterprise-grade applications. You will work on backend systems, write clean code, and collaborate with cross-functional teams.`,
    'SQL Developer':         `As a SQL Developer, you will design and optimize database schemas, write complex queries, and support data analytics and reporting. You will ensure data integrity and performance across our systems.`,
    'C++ Developer':         `We are seeking a C++ Developer to work on high-performance systems and low-level components. You will write efficient, maintainable code and collaborate with our systems engineering team.`,
    'Data Analyst':          `As a Data Analyst, you will turn raw data into actionable insights. You will build dashboards, run analysis, and help stakeholders make data-driven decisions using tools like Python, SQL, and PowerBI.`,
    'React Developer':       `We are looking for a React Developer to build fast and scalable web applications. You will work on reusable components, manage state efficiently, and collaborate with backend engineers on API integration.`,
    'Android Developer':     `As an Android Developer, you will build and maintain our Android application serving millions of users. You will write clean Kotlin/Java code, optimize app performance, and ship new features.`,
    'Data Engineer':         `We are hiring a Data Engineer to build and maintain our data pipelines. You will design ETL workflows, manage large-scale data infrastructure, and ensure reliable data delivery to analytics systems.`,
    'Software Engineer':     `As a Software Engineer, you will build robust software solutions across our technology stack. You will contribute to architectural decisions, write clean code, and mentor junior team members.`,
  }

  return descriptions[job.role] || `We are looking for a talented ${job.role} to join ${job.company}. You will work on exciting projects, collaborate with a world-class team, and contribute to building products used by millions.`
}

function generateResponsibilities(job) {
  const skills = job.skills_required.split(',').map(s => s.trim())
  return [
    `Design, develop, and maintain ${skills.slice(0,2).join(' and ')} based solutions`,
    `Collaborate with cross-functional teams to define and ship new features`,
    `Write clean, maintainable, and well-documented code`,
    `Participate in code reviews and contribute to engineering best practices`,
    `Debug, troubleshoot, and optimize existing systems for performance`,
    `Work in an agile environment with regular sprints and stand-ups`,
  ]
}

function generateQualifications(job) {
  const skills = job.skills_required.split(',').map(s => s.trim())
  return [
    `Bachelor's degree in Computer Science, IT, or related field`,
    `1–4 years of professional experience with ${skills[0]}`,
    `Strong fundamentals in data structures and algorithms`,
    `Experience with ${skills.slice(1,3).join(', ')}`,
    `Good communication and teamwork skills`,
    `Ability to work independently and manage time effectively`,
  ]
}

const PROCESS_STEPS = [
  { step: '01', title: 'Walk-in Registration',  desc: 'Carry your resume (3+ copies), photo ID, and educational certificates. Register at the reception desk.' },
  { step: '02', title: 'Aptitude Test',          desc: '30-minute online/written test covering logical reasoning, quantitative aptitude, and basic technical MCQs.' },
  { step: '03', title: 'Technical Round 1',      desc: 'Face-to-face technical interview covering your core skills, problem-solving, and project discussions.' },
  { step: '04', title: 'Technical Round 2',      desc: 'Deep-dive into system design, coding problems, and domain-specific questions with a senior engineer.' },
  { step: '05', title: 'HR Round',               desc: 'Discussion on role fit, salary expectations, joining date, and company culture.' },
  { step: '06', title: 'Offer Letter',           desc: 'Selected candidates receive an offer letter on the same day or within 2–3 business days.' },
]

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-rose-600',
  'bg-orange-500', 'bg-teal-600', 'bg-pink-600',
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-500',
]
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function JobDetail({ job, onApply, applied, onClose }) {
  if (!job) return null

  const skills = job.skills_required.split(',').map(s => s.trim())

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold text-white shadow ${avatarColor(job.company)}`}>
              {job.company[0]}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink-950">{job.company}</h2>
              <p className="text-base text-gray-600">{job.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick info row */}
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            📍 {job.location}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            📅 {fmtDate(job.date)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            🕒 {job.walkin_time}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            💰 {job.avg_salary}
          </span>
        </div>

        {/* Apply button */}
        <div className="mt-4">
          {applied ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-success">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You have applied for this walk-in
            </div>
          ) : (
            <button onClick={() => onApply(job.id)} className="btn-primary w-full py-2.5 text-sm">
              Apply for Walk-in at {job.company}
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

        {/* About the Company */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-2">About the Company</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            {job.company} is one of India's leading technology companies, known for its innovation-first culture and employee-friendly policies. With a strong presence across multiple cities, {job.company} offers excellent growth opportunities, competitive compensation, and a collaborative work environment.
          </p>
        </section>

        {/* About the Role */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-2">About the Role</h3>
          <p className="text-sm leading-relaxed text-gray-600">{generateJD(job)}</p>
        </section>

        {/* Responsibilities */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-3">Responsibilities</h3>
          <ul className="space-y-2">
            {generateResponsibilities(job).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"></span>
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Qualifications */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-3">Qualifications</h3>
          <ul className="space-y-2">
            {generateQualifications(job).map((q, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Required Skills */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Walk-in Details */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-3">Walk-in Details</h3>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium">Date</span>
              <span className="font-semibold text-amber-900">{fmtDate(job.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium">Time</span>
              <span className="font-semibold text-amber-900">{job.walkin_time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium">Venue</span>
              <span className="font-semibold text-amber-900">{job.company} Office, {job.location}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium">Package</span>
              <span className="font-bold text-green-700">{job.avg_salary}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            📎 Carry: Resume (3 copies) · Photo ID · Educational certificates · Passport size photos
          </p>
        </section>

        {/* Interview Process */}
        <section>
          <h3 className="font-display text-base font-bold text-ink-900 mb-4">Interview Process</h3>
          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200"></div>

            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className="relative flex gap-4 pl-12">
                {/* Circle */}
                <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand bg-white text-[11px] font-bold text-brand">
                  {s.step}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-ink-900">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Equal opportunity */}
        <section className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs leading-relaxed text-gray-500">
            <strong className="text-gray-700">Equal Opportunity Statement:</strong> {job.company} is committed to creating a diverse and inclusive workplace. All qualified applicants will receive consideration for employment without regard to race, color, religion, gender, national origin, disability, or any other protected status.
          </p>
        </section>

      </div>
    </div>
  )
}
