import React from 'react'

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-rose-600',
  'bg-orange-500', 'bg-teal-600', 'bg-pink-600',
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-500',
]
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function fmtDate(iso) {
  const today    = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const d        = new Date(iso)
  if (d.toDateString() === today.toDateString())    return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isToday(iso) {
  const today = new Date(); today.setHours(0,0,0,0)
  return new Date(iso).toDateString() === today.toDateString()
}

export default function JobCard({ job, onApply, applied, isTopMatch, onClick, isSelected }) {
  const dayLabel   = fmtDate(job.date)
  const todayBadge = isToday(job.date)

  return (
    <div
      onClick={() => onClick(job)}
      className={`card relative flex flex-col gap-0 overflow-hidden p-0 cursor-pointer transition-all hover:shadow-md
        ${isTopMatch  ? 'ring-2 ring-brand/40' : ''}
        ${isSelected  ? 'ring-2 ring-brand shadow-md bg-blue-50/40' : ''}`}
    >
      {isTopMatch && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          Top Match
        </span>
      )}
      {todayBadge && (
        <div className="bg-amber-500 px-4 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-white">
          Walk-in TODAY
        </div>
      )}

      {/* Company header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-white ${avatarColor(job.company)}`}>
          {job.company[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-ink-950 truncate">{job.company}</p>
          <p className="mt-0.5 truncate text-sm text-gray-500">{job.role}</p>
        </div>
      </div>

      {/* Key info */}
      <div className="grid grid-cols-2 gap-0 border-t border-gray-100 px-4 py-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Walk-in</p>
          <p className={`text-sm font-semibold mt-0.5 ${todayBadge ? 'text-amber-600' : 'text-ink-900'}`}>{dayLabel}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Package</p>
          <p className="text-sm font-bold text-success mt-0.5">{job.avg_salary}</p>
        </div>
        <div className="mt-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Timing</p>
          <p className="text-xs font-medium text-ink-800 mt-0.5">{job.walkin_time}</p>
        </div>
        <div className="mt-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Location</p>
          <p className="text-xs font-medium text-ink-800 mt-0.5">{job.location}</p>
        </div>
      </div>

      {/* Apply footer */}
      <div className="border-t border-gray-100 px-4 py-3" onClick={e => e.stopPropagation()}>
        {applied ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Applied
          </span>
        ) : (
          <button onClick={() => onApply(job.id)} className="btn-primary w-full py-2">
            Apply for Walk-in
          </button>
        )}
      </div>
    </div>
  )
}
