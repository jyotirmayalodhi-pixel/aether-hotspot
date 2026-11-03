import { Layers, Flame, CheckCircle2 } from 'lucide-react'
import { computeSummaryCounts } from '@/domain'
import { useComplaintStore } from '@/store'

export function SummaryStrip() {
  const complaints = useComplaintStore((state) => state.complaints)
  const counts = computeSummaryCounts(complaints)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total Complaints Card */}
      <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-5 flex items-center justify-between shadow-lg shadow-black/20 hover:border-[#E9E4FF]/25 transition-all">
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-wider text-[#A79FD6] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#3FD0C9]" /> Total Recorded
          </span>
          <div className="text-4xl md:text-5xl font-extrabold text-[#E9E4FF] font-['Anybody_Variable',sans-serif] tabular-nums tracking-tight">
            {counts.total}
          </div>
          <p className="text-[11px] text-[#A79FD6]">
            All logged incidents across campus
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#0D0A26]/80 border border-[#E9E4FF]/10 flex items-center justify-center shrink-0">
          <Layers className="w-6 h-6 text-[#E9E4FF]/70" />
        </div>
      </div>

      {/* 2. Pending Incidents Card (Raised + In Progress) */}
      <div
        className="bg-[#181342] rounded-2xl border border-[#FF7A18]/30 p-5 flex items-center justify-between shadow-lg shadow-[#FF7A18]/5 hover:border-[#FF7A18]/50 transition-all relative overflow-hidden group"
        title="Raised plus In Progress"
      >
        <div className="space-y-1 relative z-10">
          <span className="text-xs uppercase font-mono tracking-wider text-[#FFD23F] flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#E5237A] animate-pulse" />
            Pending
          </span>
          <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD23F] via-[#FF7A18] to-[#E5237A] font-['Anybody_Variable',sans-serif] tabular-nums tracking-tight">
            {counts.pending}
          </div>
          <p className="text-[11px] text-[#E9E4FF]/90 font-medium">
            <span className="text-[#E5237A] font-bold">{counts.raised} raised</span> ·{' '}
            <span className="text-[#FFD23F] font-bold">{counts.inProgress} in progress</span>
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-[#0D0A26]/80 border border-[#FF7A18]/30 flex items-center justify-center shrink-0 relative z-10">
          <Flame className="w-6 h-6 text-[#FF7A18] animate-pulse" />
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FF7A18]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FF7A18]/20 transition-all" />
      </div>

      {/* 3. Resolved Incidents Card */}
      <div className="bg-[#181342] rounded-2xl border border-[#3FD0C9]/30 p-5 flex items-center justify-between shadow-lg shadow-[#3FD0C9]/5 hover:border-[#3FD0C9]/50 transition-all relative overflow-hidden group">
        <div className="space-y-1 relative z-10">
          <span className="text-xs uppercase font-mono tracking-wider text-[#3FD0C9] flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
          <div className="text-4xl md:text-5xl font-extrabold text-[#3FD0C9] font-['Anybody_Variable',sans-serif] tabular-nums tracking-tight">
            {counts.resolved}
          </div>
          <p className="text-[11px] text-[#A79FD6]">
            Verified resolved & closed issues
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-[#0D0A26]/80 border border-[#3FD0C9]/30 flex items-center justify-center shrink-0 relative z-10">
          <CheckCircle2 className="w-6 h-6 text-[#3FD0C9]" />
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#3FD0C9]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#3FD0C9]/20 transition-all" />
      </div>
    </div>
  )
}
