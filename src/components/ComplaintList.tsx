import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  PlusCircle,
  Inbox,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  scoreComplaint,
  getTopPriorityQueue,
} from '@/domain'
import type { Complaint } from '@/domain'
import { useComplaintStore } from '@/store'
import {
  interpolateThermalColor,
  getThermalFontVariation,
} from '@/lib/thermal'

interface ComplaintListProps {
  onOpenReportDialog: () => void
}

export function ComplaintList({ onOpenReportDialog }: ComplaintListProps) {
  const complaints = useComplaintStore((state) => state.complaints)
  const advanceStatus = useComplaintStore((state) => state.advanceStatus)
  const searchQuery = useComplaintStore((state) => state.searchQuery)
  const categoryFilter = useComplaintStore((state) => state.categoryFilter)
  const statusFilter = useComplaintStore((state) => state.statusFilter)
  const sortBy = useComplaintStore((state) => state.sortBy)
  const timeOffsetHours = useComplaintStore((state) => state.timeOffsetHours)
  const formulaMode = useComplaintStore((state) => state.formulaMode)
  const tieBreakOrder = useComplaintStore((state) => state.tieBreakOrder)
  const setCategoryFilter = useComplaintStore((state) => state.setCategoryFilter)
  const setStatusFilter = useComplaintStore((state) => state.setStatusFilter)
  const setSearchQuery = useComplaintStore((state) => state.setSearchQuery)
  const setSortBy = useComplaintStore((state) => state.setSortBy)

  // Guard against rapid double-clicks
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAdvance = (id: string) => {
    if (processingId === id) return
    setProcessingId(id)
    advanceStatus(id)
    setTimeout(() => {
      setProcessingId(null)
    }, 250)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('All')
    setStatusFilter('All')
    setSortBy('priority')
  }

  // 1. Filter complaints
  const filtered = complaints.filter((c) => {
    // Category filter
    if (categoryFilter !== 'All' && c.category !== categoryFilter) {
      return false
    }

    // Status filter
    if (statusFilter !== 'All' && c.status !== statusFilter) {
      return false
    }

    // Search query matching id, description, category
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      const matchId = c.id.toLowerCase().includes(q)
      const matchDesc = c.description.toLowerCase().includes(q)
      const matchCat = c.category.toLowerCase().includes(q)
      if (!matchId && !matchDesc && !matchCat) {
        return false
      }
    }

    return true
  })

  // 2. Sort complaints
  const nowMs = Date.now()
  const sorted: Complaint[] = [...filtered]

  if (sortBy === 'newest') {
    sorted.sort((a, b) => b.submittedAt - a.submittedAt)
  } else if (sortBy === 'oldest') {
    sorted.sort((a, b) => a.submittedAt - b.submittedAt)
  } else {
    // 'priority' sort: unresolved items sorted by priority queue logic, resolved items at bottom
    const unresolved = sorted.filter((c) => c.status !== 'Resolved')
    const resolved = sorted.filter((c) => c.status === 'Resolved')

    // Use domain priority queue scoring for unresolved complaints
    const scoredUnresolved = getTopPriorityQueue(
      unresolved,
      nowMs,
      timeOffsetHours,
      formulaMode,
      tieBreakOrder,
      unresolved.length
    )

    resolved.sort((a, b) => b.submittedAt - a.submittedAt)

    sorted.length = 0
    sorted.push(...scoredUnresolved, ...resolved)
  }

  // Empty state A: Store is empty
  if (complaints.length === 0) {
    return (
      <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-12 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#0D0A26] border border-[#E9E4FF]/15 flex items-center justify-center mx-auto text-[#3FD0C9]">
          <Inbox className="w-8 h-8 opacity-60" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
            No complaints recorded yet
          </h3>
          <p className="text-xs text-[#A79FD6] max-w-sm mx-auto">
            The system is clear. Click below to log your first campus incident.
          </p>
        </div>
        <Button
          onClick={onOpenReportDialog}
          className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/90 font-bold text-xs h-9 px-4 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report an issue
        </Button>
      </div>
    )
  }

  // Empty state B: Filter returns 0 items
  if (sorted.length === 0) {
    return (
      <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-12 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#0D0A26] border border-[#E9E4FF]/15 flex items-center justify-center mx-auto text-[#FF7A18]">
          <RotateCcw className="w-8 h-8 opacity-60" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
            No complaints match the current filters
          </h3>
          <p className="text-xs text-[#A79FD6] max-w-sm mx-auto">
            Try adjusting your search query, category selection, or status filter.
          </p>
        </div>
        <Button
          onClick={handleClearFilters}
          className="bg-[#261F63] hover:bg-[#322982] text-xs text-[#E9E4FF] border border-[#E9E4FF]/20 h-9 px-4 cursor-pointer"
        >
          Clear filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#A79FD6] px-1 font-mono">
        <span>Showing {sorted.length} {sorted.length === 1 ? 'incident' : 'incidents'}</span>
        <span>Forward-Only Workflow</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {sorted.map((complaint) => {
            const isProcessing = processingId === complaint.id
            const calculation = scoreComplaint(
              complaint,
              nowMs,
              timeOffsetHours,
              formulaMode
            )

            // Age formatting: "3d 0h (72h)" or "8h"
            const totalHours = Math.max(
              0,
              Math.round((nowMs - complaint.submittedAt) / 3600000 + timeOffsetHours)
            )
            const days = Math.floor(totalHours / 24)
            const ageDisplay =
              days > 0
                ? `${days}d ${totalHours % 24}h (${totalHours}h)`
                : `${totalHours}h (${totalHours}h)`

            // Thermal score styling
            const scoreVal = calculation ? calculation.score : null
            const scoreColor =
              scoreVal !== null ? interpolateThermalColor(scoreVal) : '#3FD0C9'
            const fontVar =
              scoreVal !== null ? getThermalFontVariation(scoreVal) : null

            return (
              <motion.div
                key={complaint.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`bg-[#181342] hover:bg-[#1C174D] rounded-2xl border transition-all p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20 ${
                  complaint.status === 'Resolved'
                    ? 'border-[#3FD0C9]/20'
                    : 'border-[#E9E4FF]/12 hover:border-[#E9E4FF]/25'
                }`}
              >
                {/* Left Block: Score / Status Badge + Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Score Numeral Badge or Resolved Badge */}
                  {complaint.status === 'Resolved' ? (
                    <div className="w-14 h-14 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/35 flex flex-col items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#3FD0C9]" />
                      <span className="text-[10px] font-mono text-[#3FD0C9] font-bold mt-0.5">
                        DONE
                      </span>
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl bg-[#0D0A26] border flex flex-col items-center justify-center shrink-0 shadow-md group relative"
                      style={{ borderColor: `${scoreColor}50` }}
                    >
                      <span
                        className="text-3xl leading-none select-none transition-transform group-hover:scale-110"
                        style={{
                          ...(fontVar ? fontVar.style : {}),
                          color: scoreColor,
                          textShadow: `0 0 15px ${scoreColor}40`,
                        }}
                      >
                        {scoreVal}
                      </span>
                      <span className="text-[9px] font-mono text-[#A79FD6] tracking-tighter">
                        HEAT
                      </span>
                    </div>
                  )}

                  {/* Text Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* ID */}
                      <span className="font-mono font-bold text-sm text-[#E9E4FF] tracking-wider">
                        {complaint.id}
                      </span>

                      {/* Category Chip */}
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#0D0A26] text-[#E9E4FF] border border-[#E9E4FF]/15">
                        {complaint.category}
                      </span>

                      {/* Status Badge */}
                      {complaint.status === 'Raised' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5237A]/20 text-[#E5237A] border border-[#E5237A]/40 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5237A] animate-pulse" />
                          Raised
                        </span>
                      )}
                      {complaint.status === 'In Progress' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFD23F]/20 text-[#FFD23F] border border-[#FFD23F]/40 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD23F]" />
                          In Progress
                        </span>
                      )}
                      {complaint.status === 'Resolved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3FD0C9]/20 text-[#3FD0C9] border border-[#3FD0C9]/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#3FD0C9]" />
                          Resolved
                        </span>
                      )}

                      {/* Age formatted as '3d 0h (72h)' */}
                      <span className="text-xs text-[#A79FD6] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {ageDisplay}
                      </span>
                    </div>

                    {/* Wrapping Plain-Text Description */}
                    <p className="text-sm text-[#E9E4FF] leading-relaxed break-words font-sans">
                      {complaint.description}
                    </p>

                    {/* Arithmetic Explanation String */}
                    {calculation && (
                      <div className="flex items-center gap-2 text-xs font-mono text-[#3FD0C9]/90 pt-0.5">
                        <Flame className="w-3 h-3 text-[#FF7A18]" />
                        <span>{calculation.arithmeticText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Block: Single Forward-Only Status Button */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {complaint.status === 'Raised' && (
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAdvance(complaint.id)}
                      className="bg-[#261F63] hover:bg-[#322982] text-xs font-semibold text-[#E9E4FF] border border-[#E9E4FF]/20 h-9 px-4 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 text-[#3FD0C9]" />
                      <span>Start work</span>
                    </Button>
                  )}

                  {complaint.status === 'In Progress' && (
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAdvance(complaint.id)}
                      className="bg-[#3FD0C9] hover:bg-[#3FD0C9]/85 text-xs font-bold text-[#0D0A26] h-9 px-4 cursor-pointer shadow-lg shadow-[#3FD0C9]/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>Mark resolved</span>
                    </Button>
                  )}

                  {complaint.status === 'Resolved' && (
                    <div className="text-xs font-mono text-[#3FD0C9] bg-[#3FD0C9]/10 border border-[#3FD0C9]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
