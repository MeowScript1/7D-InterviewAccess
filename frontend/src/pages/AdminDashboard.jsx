import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

const EMPTY_JOB = {
  company:'', role:'', skills_required:'', location:'', date:'',
  walkin_time:'10:00 AM - 4:00 PM', avg_salary:'',
  company_about:'', job_description:'', responsibilities:'', qualifications:'', interview_steps:'',
  location_url:'', location_desc:''
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{boxShadow:'0 2px 12px rgba(0,0,0,0.4)'}}
      className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-5">
      <p className="text-xl">{icon}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-600">{label}</p>
    </div>
  )
}

function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all
        ${active ? 'bg-brand text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
        ${active ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>
        {count}
      </span>
    </button>
  )
}

// Textarea with label
function Field({ label, value, onChange, placeholder, rows=1, hint }) {
  return (
    <div className="col-span-2">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-600">
        {label}
        {hint && <span className="ml-2 normal-case font-normal text-gray-700 tracking-normal">{hint}</span>}
      </label>
      {rows > 1 ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          rows={rows} placeholder={placeholder}
          className="input resize-none text-sm leading-relaxed" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} className="input text-sm" />
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab,     setTab]     = useState('jobs')
  const [jobs,    setJobs]    = useState([])
  const [users,   setUsers]   = useState([])
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState('')
  const [showForm,setShowForm]= useState(false)
  const [editId,  setEditId]  = useState(null)
  const [form,    setForm]    = useState(EMPTY_JOB)
  const [saving,  setSaving]  = useState(false)
  const [deleteId,setDeleteId]= useState(null)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    if (!localStorage.getItem('admin')) navigate('/admin')
  }, [])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [j,u,a] = await Promise.all([
        fetch(`${API}/admin/jobs`).then(r=>r.json()),
        fetch(`${API}/admin/users`).then(r=>r.json()),
        fetch(`${API}/admin/applications`).then(r=>r.json()),
      ])
      setJobs(j); setUsers(u); setApps(a)
    } catch { showToast('Failed to load data.') }
    finally { setLoading(false) }
  }

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''), 3000) }

  function openAdd()   { setForm(EMPTY_JOB); setEditId(null); setShowForm(true) }
  function openEdit(j) {
    setForm({
      company: j.company||'', role: j.role||'',
      skills_required: j.skills_required||'', location: j.location||'',
      date: j.date||'', walkin_time: j.walkin_time||'',
      avg_salary: j.avg_salary||'',
      company_about: j.company_about||'',
      job_description: j.job_description||'',
      responsibilities: j.responsibilities||'',
      qualifications: j.qualifications||'',
      interview_steps: j.interview_steps||'',
      location_url: j.location_url||'',
      location_desc: j.location_desc||'',
    })
    setEditId(j.id)
    setShowForm(true)
  }

  function setF(key) { return val => setForm(p=>({...p,[key]:val})) }

  async function saveJob(e) {
    e.preventDefault(); setSaving(true)
    try {
      const url    = editId ? `${API}/admin/jobs/${editId}` : `${API}/admin/jobs`
      const method = editId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save.')
      showToast(editId ? '✅ Job updated!' : '✅ Job added!')
      setShowForm(false)
      fetchAll()
    } catch(err) { showToast(err.message) }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    try {
      await fetch(`${API}/admin/jobs/${deleteId}`, {method:'DELETE'})
      showToast('Job deleted.')
      setDeleteId(null); fetchAll()
    } catch { showToast('Delete failed.') }
  }

  function logout() { localStorage.removeItem('admin'); navigate('/admin') }

  function fmtDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
  }

  const filteredJobs = jobs.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#111111]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">7D</span>
            <div>
              <p className="text-sm font-bold text-white leading-tight">InterviewAccess</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <button onClick={logout}
            className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-900 hover:text-red-400">
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard label="Total Jobs"       value={jobs.length}  color="text-brand"       icon="💼" />
          <StatCard label="Registered Users" value={users.length} color="text-violet-400"  icon="👥" />
          <StatCard label="Applications"     value={apps.length}  color="text-green-400"   icon="📋" />
        </div>

        {/* Tabs + actions */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            <Tab label="Jobs"         active={tab==='jobs'}  onClick={()=>setTab('jobs')}  count={jobs.length} />
            <Tab label="Users"        active={tab==='users'} onClick={()=>setTab('users')} count={users.length} />
            <Tab label="Applications" active={tab==='apps'}  onClick={()=>setTab('apps')}  count={apps.length} />
          </div>
          {tab==='jobs' && (
            <div className="flex items-center gap-2">
              <input value={search} onChange={e=>setSearch(e.target.value)}
                className="input w-52 py-2 text-sm" placeholder="Search jobs…" />
              <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm">+ Add Job</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-800"/>
            ))}
          </div>
        ) : (
          <>
            {/* JOBS TABLE */}
            {tab==='jobs' && (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#161616] text-left">
                      {['Company','Role','Location','Walk-in','Timing','Package','JD','Actions'].map(h=>(
                        <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredJobs.map(job=>(
                      <tr key={job.id} className="bg-[#141414] hover:bg-[#1c1c1c] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-200">{job.company}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{job.role}</td>
                        <td className="px-4 py-3 text-gray-500">{job.location}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(job.date)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{job.walkin_time}</td>
                        <td className="px-4 py-3 font-bold text-green-400 whitespace-nowrap">{job.avg_salary}</td>
                        <td className="px-4 py-3">
                          {job.job_description ? (
                            <span className="text-[10px] rounded-full bg-green-900/30 text-green-500 px-2 py-0.5 font-bold">✓ Added</span>
                          ) : (
                            <span className="text-[10px] rounded-full bg-red-900/20 text-red-500 px-2 py-0.5 font-bold">✗ Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={()=>openEdit(job)}
                              className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20">
                              ✏️ Edit
                            </button>
                            <button onClick={()=>setDeleteId(job.id)}
                              className="rounded-lg bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/40">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredJobs.length === 0 && (
                  <div className="py-12 text-center text-gray-700 text-sm">No jobs found.</div>
                )}
              </div>
            )}

            {/* USERS TABLE */}
            {tab==='users' && (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#161616] text-left">
                      {['#','Name','Email','Skills','Applied'].map(h=>(
                        <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {users.map(u=>(
                      <tr key={u.id} className="bg-[#141414] hover:bg-[#1c1c1c] transition-colors">
                        <td className="px-4 py-3 text-gray-700 text-xs">#{u.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-200">{u.name}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.skills ? u.skills.split(',').map(s=>(
                              <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                                {s.trim()}
                              </span>
                            )) : <span className="text-gray-700 text-xs">No skills</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {apps.filter(a=>a.user_email===u.email).length} jobs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* APPLICATIONS TABLE */}
            {tab==='apps' && (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-[#161616] text-left">
                      {['Applicant','Email','Company','Role','Walk-in','Applied At','Status'].map(h=>(
                        <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {apps.map(a=>(
                      <tr key={a.id} className="bg-[#141414] hover:bg-[#1c1c1c] transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-200">{a.user_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{a.user_email}</td>
                        <td className="px-4 py-3 text-gray-300">{a.company}</td>
                        <td className="px-4 py-3 text-gray-400">{a.role}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(a.date)}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {new Date(a.applied_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold
                            ${a.status==='attended'  ? 'bg-green-900/40 text-green-400' :
                              a.status==='cancelled' ? 'bg-red-900/30 text-red-400' :
                              'bg-blue-900/30 text-blue-400'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Add/Edit Job Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 bg-[#141414] shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#141414] px-6 py-4">
              <h2 className="font-display text-lg font-bold text-gray-100">
                {editId ? '✏️ Edit Job' : '➕ Add New Job'}
              </h2>
              <button onClick={()=>setShowForm(false)} className="text-gray-600 hover:text-gray-300">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={saveJob} className="p-6 space-y-6">

              {/* Section: Basic Info */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600 border-b border-gray-800 pb-2">Basic Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Company</label>
                    <input value={form.company} onChange={e=>setF('company')(e.target.value)}
                      className="input text-sm" placeholder="Google" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Role</label>
                    <input value={form.role} onChange={e=>setF('role')(e.target.value)}
                      className="input text-sm" placeholder="Python Developer" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Location</label>
                    <input value={form.location} onChange={e=>setF('location')(e.target.value)}
                      className="input text-sm" placeholder="Bangalore" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Walk-in Date</label>
                    <input type="date" value={form.date} onChange={e=>setF('date')(e.target.value)}
                      className="input text-sm" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Timing</label>
                    <input value={form.walkin_time} onChange={e=>setF('walkin_time')(e.target.value)}
                      className="input text-sm" placeholder="10:00 AM - 4:00 PM" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Avg. Package</label>
                    <input value={form.avg_salary} onChange={e=>setF('avg_salary')(e.target.value)}
                      className="input text-sm" placeholder="10-15 LPA" required/>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Skills Required <span className="font-normal text-gray-700 normal-case">(comma separated)</span>
                    </label>
                    <input value={form.skills_required} onChange={e=>setF('skills_required')(e.target.value)}
                      className="input text-sm" placeholder="Python, Django, SQL, REST" required/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Google Maps URL</label>
                    <input value={form.location_url} onChange={e=>setF('location_url')(e.target.value)}
                      className="input text-sm" placeholder="https://maps.app.goo.gl/..."/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Venue Address</label>
                    <input value={form.location_desc} onChange={e=>setF('location_desc')(e.target.value)}
                      className="input text-sm" placeholder="Full office address shown to candidates"/>
                  </div>
                </div>
              </div>

              {/* Section: Job Content */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600 border-b border-gray-800 pb-2">Job Content (shown to candidates)</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">About the Company</label>
                    <textarea value={form.company_about} onChange={e=>setF('company_about')(e.target.value)}
                      rows={3} className="input resize-none text-sm leading-relaxed"
                      placeholder="Brief company description shown to candidates..."/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">Job Description</label>
                    <textarea value={form.job_description} onChange={e=>setF('job_description')(e.target.value)}
                      rows={3} className="input resize-none text-sm leading-relaxed"
                      placeholder="Describe the role and what the candidate will do..."/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Responsibilities <span className="font-normal text-gray-700 normal-case">(one per line, separated by |)</span>
                    </label>
                    <textarea value={form.responsibilities} onChange={e=>setF('responsibilities')(e.target.value)}
                      rows={4} className="input resize-none text-sm leading-relaxed"
                      placeholder="Build APIs using Python|Write unit tests|Review code with team"/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Qualifications <span className="font-normal text-gray-700 normal-case">(one per line, separated by |)</span>
                    </label>
                    <textarea value={form.qualifications} onChange={e=>setF('qualifications')(e.target.value)}
                      rows={4} className="input resize-none text-sm leading-relaxed"
                      placeholder="B.Tech in CS or related field|2+ years Python experience|Strong SQL skills"/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Interview Steps <span className="font-normal text-gray-700 normal-case">(one per line, separated by |)</span>
                    </label>
                    <textarea value={form.interview_steps} onChange={e=>setF('interview_steps')(e.target.value)}
                      rows={3} className="input resize-none text-sm leading-relaxed"
                      placeholder="Walk-in Registration|Aptitude Test|Technical Round 1|HR Round|Offer Letter"/>
                  </div>
                </div>
              </div>

              {/* Section: Location */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600 border-b border-gray-800 pb-2">Location Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Google Maps URL <span className="font-normal text-gray-700 normal-case">(paste the full Google Maps link)</span>
                    </label>
                    <input value={form.location_url} onChange={e=>setF('location_url')(e.target.value)}
                      className="input text-sm" placeholder="https://maps.google.com/?q=Company+Office+City"/>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
                      Venue Description <span className="font-normal text-gray-700 normal-case">(full address shown to candidates)</span>
                    </label>
                    <textarea value={form.location_desc} onChange={e=>setF('location_desc')(e.target.value)}
                      rows={2} className="input resize-none text-sm leading-relaxed"
                      placeholder="Company Name, Building, Street, Area, City - PIN. Nearest metro/landmark."/>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t border-gray-800">
                <button type="submit" className="btn-primary flex-1 py-3" disabled={saving}>
                  {saving ? 'Saving…' : editId ? '✅ Update Job' : '✅ Add Job'}
                </button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost flex-1 py-3">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-[#141414] p-6 shadow-2xl text-center">
            <p className="text-4xl mb-4">🗑️</p>
            <h3 className="font-display text-lg font-bold text-gray-100">Delete this job?</h3>
            <p className="mt-2 text-sm text-gray-500">All applications for this job will also be deleted. This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={confirmDelete} className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                Yes, Delete
              </button>
              <button onClick={()=>setDeleteId(null)} className="btn-ghost flex-1 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-100 px-6 py-3 text-sm font-medium text-gray-900 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
