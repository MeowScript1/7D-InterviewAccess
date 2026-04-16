import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const API = 'http://localhost:8000'

// All skills the backend can detect
const ALL_SKILLS = [
  'python', 'java', 'sql', 'html', 'css', 'c++', 'javascript',
  'react', 'django', 'spring', 'node', 'typescript', 'docker',
  'kubernetes', 'redis', 'kafka', 'linux', 'excel', 'tableau',
]

export default function ResumeUpload() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef()

  const [file,      setFile]      = useState(null)
  const [skills,    setSkills]    = useState(
    // Pre-populate if user already has skills
    user.skills ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  )
  const [uploading, setUploading] = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError('')
    } else {
      setError('Please drop a PDF file.')
    }
  }

  function handleFileChange(e) {
    const picked = e.target.files[0]
    if (picked) { setFile(picked); setError('') }
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return setError('Please select a PDF file.')
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)

      const res  = await fetch(`${API}/upload-resume?user_id=${user.id}`, {
        method: 'POST',
        body:   form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed.')

      setSkills(data.skills)
      setDone(true)

      // Update user in context/localStorage so Dashboard can use skills
      login({ ...user, skills: data.skills.join(',') })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Resume Upload</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your PDF resume. We'll extract your skills and personalise job matches.
        </p>
      </div>

      {/* ── Current skills ── */}
      {skills.length > 0 && (
        <div className="card mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {done ? 'Skills extracted from your resume' : 'Your current skills'}
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span
                key={s}
                className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
              >
                {s}
              </span>
            ))}
          </div>
          {done && (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-5 w-full"
            >
              See Matched Interviews →
            </button>
          )}
        </div>
      )}

      {/* ── Upload zone ── */}
      {!done && (
        <div className="card">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-all
              ${dragging ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/50 hover:bg-gray-50'}`}
          >
            <svg className="mb-4 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file ? (
              <div className="text-center">
                <p className="font-medium text-ink-900">{file.name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium text-ink-800">Drop your PDF here</p>
                <p className="mt-1 text-sm text-gray-400">or click to browse</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef} type="file" accept=".pdf"
            className="hidden" onChange={handleFileChange}
          />

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary mt-4 w-full py-3 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Extracting skills…
              </span>
            ) : (
              'Upload & Extract Skills'
            )}
          </button>
        </div>
      )}

      {/* ── Skills reference ── */}
      <div className="card mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Skills we detect automatically
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SKILLS.map(s => (
            <span
              key={s}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium
                ${skills.includes(s)
                  ? 'border-brand/20 bg-brand/10 text-brand'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
