import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Flame,
  CheckCircle2,
  Play,
  Check,
  Clock,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTopPriorityQueue } from '@/domain'
import { useComplaintStore } from '@/store'
import {
  interpolateThermalColor,
  getThermalFontVariation,
} from '@/lib/thermal'

export function PriorityQueue() {
  const complaints = useComplaintStore((state) => state.complaints)
  const timeOffsetHours = useComplaintStore((state) => state.timeOffsetHours)
  const formulaMode = useComplaintStore((state) => state.formulaMode)
  const tieBreakOrder = useComplaintStore((state) => state.tieBreakOrder)
  const setFormulaMode = useComplaintStore((state) => state.setFormulaMode)
  const setTieBreakOrder = useComplaintStore((state) => state.setTieBreakOrder)
  const advanceStatus = useComplaintStore((state) => state.advanceStatus)
  const selectedComplaintId = useComplaintStore((state) => state.selectedComplaintId)
  const setSelectedComplaintId = useComplaintStore(
    (state) => state.setSelectedComplaintId
  )
  const setCategoryFilter = useComplaintStore((state) => state.setCategoryFilter)
  const setStatusFilter = useComplaintStore((state) => state.setStatusFilter)
  const setSearchQuery = useComplaintStore((state) => state.setSearchQuery)

  const [processingId, setProcessingId] = useState<string | null>(null)

  const nowMs = Date.now()

  // Get Top-3 unresolved complaints directly from domain engine
  const topQueue = getTopPriorityQueue(
    complaints,
    nowMs,
    timeOffsetHours,
    formulaMode,
    tieBreakOrder,
    3
  )

  const handleAdvance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (processingId === id) return
    setProcessingId(id)
    advanceStatus(id)
    setTimeout(() => {
      setProcessingId(null)
    }, 250)
  }

  const handleCardClick = (id: string) => {
    // Select this complaint
    setSelectedComplaintId(id)

    // Ensure list filters don't hide the row
    setCategoryFilter('All')
    setStatusFilter('All')
    setSearchQuery('')

    // Scroll to the complaint in ComplaintList below
    setTimeout(() => {
      const el = document.getElementById(`complaint-row-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  // Category badge styling helper
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Laboratory':
        return 'bg-[#E5237A]/15 text-[#E5237A] border-[#E5237A]/35'
      case 'Wi-Fi':
        return 'bg-[#3FD0C9]/15 text-[#3FD0C9] border-[#3FD0C9]/35'
      case 'Hostel':
        return 'bg-[#FF7A18]/15 text-[#FF7A18] border-[#FF7A18]/35'
      case 'Classroom':
        return 'bg-[#FFD23F]/15 text-[#FFD23F] border-[#FFD23F]/35'
      default:
        return 'bg-[#E9E4FF]/10 text-[#E9E4FF] border-[#E9E4FF]/20'
    }
  }

  return (
    <section
      aria-label="Priority Queue"
      className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-5 md:p-6 shadow-xl space-y-5"
    >
      {/* Header with Title and Transient Control Switches */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E9E4FF]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5237A]/20 to-[#FF7A18]/20 border border-[#E5237A]/30 flex items-center justify-center text-[#FF7A18] shadow-md shadow-[#E5237A]/10">
            <Flame className="w-5 h-5 text-[#FF7A18]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif] tracking-tight">
                Hottest right now
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30">
                Top 3 Queue
              </span>
            </div>
            <p className="text-xs text-[#A79FD6]">
              Real-time priority dispatch ranked by urgency score & continuous wait time.
            </p>
          </div>
        </div>

        {/* Transient Rule Switches (Never saved to localStorage) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Formula Mode Toggle */}
          <div className="flex items-center bg-[#0D0A26] rounded-xl p-1 border border-[#E9E4FF]/12">
            <span className="text-[11px] font-mono text-[#A79FD6] px-2.5 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#3FD0C9]" />
              Formula:
            </span>
            <button
              type="button"
              onClick={() => setFormulaMode('baseline')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formulaMode === 'baseline'
                  ? 'bg-[#3FD0C9] text-[#0D0A26] font-bold shadow-sm'
                  : 'text-[#A79FD6] hover:text-[#E9E4FF]'
              }`}
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => setFormulaMode('enhanced')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                formulaMode === 'enhanced'
                  ? 'bg-[#FF7A18] text-[#0D0A26] font-bold shadow-sm'
                  : 'text-[#A79FD6] hover:text-[#E9E4FF]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Enhanced SLA
            </button>
          </div>

          {/* Tie-Break Order Toggle */}
          <div className="flex items-center bg-[#0D0A26] rounded-xl p-1 border border-[#E9E4FF]/12">
            <span className="text-[11px] font-mono text-[#A79FD6] px-2.5 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#FFD23F]" />
              Tie-Break:
            </span>
            <button
              type="button"
              onClick={() => setTieBreakOrder('age-first')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tieBreakOrder === 'age-first'
                  ? 'bg-[#FFD23F] text-[#0D0A26] font-bold shadow-sm'
                  : 'text-[#A79FD6] hover:text-[#E9E4FF]'
              }`}
            >
              Age-First
            </button>
            <button
              type="button"
              onClick={() => setTieBreakOrder('category-first')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tieBreakOrder === 'category-first'
                  ? 'bg-[#E5237A] text-[#0D0A26] font-bold shadow-sm'
                  : 'text-[#A79FD6] hover:text-[#E9E4FF]'
              }`}
            >
              Category-First
            </button>
          </div>
        </div>
      </div>

      {/* Top-3 Cards Grid or Cool Mint Empty State */}
      {topQueue.length === 0 ? (
        <div className="bg-[#0D0A26] rounded-xl border border-[#3FD0C9]/30 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#3FD0C9]/15 border border-[#3FD0C9]/40 flex items-center justify-center mx-auto text-[#3FD0C9]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#3FD0C9] font-['Anybody_Variable',sans-serif]">
              All clear. No open complaints.
            </h3>
            <p className="text-xs text-[#A79FD6] max-w-md mx-auto">
              Every reported issue has been marked resolved. The campus is currently running without active thermal hotspots.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          <AnimatePresence mode="popLayout">
            {topQueue.map((item) => {
              const scoreColor = interpolateThermalColor(item.score)
              const fontVar = getThermalFontVariation(item.score)
              const isSelected = selectedComplaintId === item.id
              const totalHours = Math.round(item.hoursPending)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => handleCardClick(item.id)}
                  className={`relative rounded-xl p-4 md:p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 border bg-[#0D0A26] hover:bg-[#140F38] shadow-lg group ${
                    isSelected
                      ? 'border-[#FFD23F] ring-2 ring-[#FFD23F]/50 shadow-[0_0_25px_rgba(255,210,63,0.25)]'
                      : 'border-[#E9E4FF]/12 hover:border-[#E9E4FF]/30'
                  }`}
                >
                  {/* Card Header: Rank Badge, ID, Category & Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Rank Pill */}
                        <div
                          className="w-7 h-7 rounded-lg font-['Anybody_Variable',sans-serif] font-black text-xs flex items-center justify-center shadow-sm"
                          style={{
                            backgroundColor: `${scoreColor}25`,
                            color: scoreColor,
                            border: `1px solid ${scoreColor}60`,
                          }}
                        >
                          #{item.rank}
                        </div>
                        {/* Complaint ID */}
                        <span className="font-mono text-sm font-bold text-[#E9E4FF]">
                          {item.id}
                        </span>
                      </div>

                      {/* Status Chip */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          item.status === 'Raised'
                            ? 'bg-[#FF7A18]/15 text-[#FF7A18] border-[#FF7A18]/30'
                            : 'bg-[#FFD23F]/15 text-[#FFD23F] border-[#FFD23F]/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Category & Age Row */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium text-[11px] border ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      <span className="font-mono text-[#A79FD6] text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalHours}h pending
                      </span>
                    </div>

                    {/* Big Urgency Score Numeral */}
                    <div className="pt-2 pb-1 flex items-baseline justify-between border-y border-[#E9E4FF]/8">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#A79FD6] block">
                          Urgency Score
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-4xl md:text-5xl leading-none select-none transition-transform group-hover:scale-105 inline-block"
                            style={{
                              ...fontVar.style,
                              color: scoreColor,
                              textShadow: `0 0 20px ${scoreColor}40`,
                            }}
                          >
                            {item.score}
                          </span>
                          <span className="text-[11px] font-mono text-[#A79FD6]">
                            / 10 max
                          </span>
                        </div>
                      </div>

                      {/* Visual Heat Bar indicator */}
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-[#A79FD6] block">
                          Thermal Load
                        </span>
                        <div className="w-16 h-2 bg-[#181342] rounded-full overflow-hidden border border-[#E9E4FF]/10 mt-1">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${item.heatRatio * 100}%`,
                              backgroundColor: scoreColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <p className="text-xs text-[#E9E4FF]/90 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Arithmetic Breakdown */}
                    <div className="bg-[#181342]/70 rounded-lg p-2 border border-[#E9E4FF]/8 text-[11px] font-mono text-[#A79FD6]">
                      <span className="text-[#3FD0C9] font-semibold">
                        {item.arithmeticText}
                      </span>
                    </div>

                    {/* Comparative Tie-Break Sentence */}
                    <div className="bg-[#181342]/90 rounded-lg p-2.5 border border-[#FFD23F]/20 text-[11px] leading-snug text-[#E9E4FF] flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-[#FFD23F] shrink-0 mt-0.5" />
                      <span className="text-[#FFD23F]/95">
                        {item.tieBreakSentence}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Forward-Only Action Button */}
                  <div className="pt-2 border-t border-[#E9E4FF]/8">
                    {item.status === 'Raised' && (
                      <Button
                        size="sm"
                        onClick={(e) => handleAdvance(item.id, e)}
                        disabled={processingId === item.id}
                        className="w-full bg-[#FF7A18] hover:bg-[#FF7A18]/85 text-[#0D0A26] font-bold text-xs h-8 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start work
                      </Button>
                    )}
                    {item.status === 'In Progress' && (
                      <Button
                        size="sm"
                        onClick={(e) => handleAdvance(item.id, e)}
                        disabled={processingId === item.id}
                        className="w-full bg-[#3FD0C9] hover:bg-[#3FD0C9]/85 text-[#0D0A26] font-bold text-xs h-8 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
