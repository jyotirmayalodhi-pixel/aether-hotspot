import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  HelpCircle,
  Flame,
  Layers,
  Award,
  ListOrdered,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplaintStore } from '@/store'
import { getTopPriorityQueue } from '@/domain'
import { interpolateThermalColor, getThermalFontVariation } from '@/lib/thermal'

interface ScoringExplainerDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ScoringExplainerDialog({
  isOpen,
  onClose,
}: ScoringExplainerDialogProps) {
  const complaints = useComplaintStore((state) => state.complaints)
  const timeOffsetHours = useComplaintStore((state) => state.timeOffsetHours)
  const formulaMode = useComplaintStore((state) => state.formulaMode)
  const tieBreakOrder = useComplaintStore((state) => state.tieBreakOrder)

  const nowMs = Date.now()
  const topQueue = getTopPriorityQueue(
    complaints,
    nowMs,
    timeOffsetHours,
    formulaMode,
    tieBreakOrder,
    3
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-3xl bg-[#181342] border border-[#E9E4FF]/15 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scoring-explainer-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E9E4FF]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/30 flex items-center justify-center text-[#3FD0C9]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="scoring-explainer-title"
                    className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]"
                  >
                    How Scoring & Priority Works
                  </h3>
                  <p className="text-xs text-[#A79FD6]">
                    Deterministic priority engine with mathematical tie-breaking.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-[#A79FD6] hover:text-[#E9E4FF] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0D0A26] rounded-xl p-3.5 border border-[#E9E4FF]/10 space-y-1">
                <span className="text-[#3FD0C9] font-bold font-mono text-[11px] uppercase tracking-wider block">
                  Definition: "Pending" Status
                </span>
                <p className="text-[#A79FD6] leading-relaxed">
                  A complaint is strictly <strong className="text-[#E9E4FF]">Pending</strong> if its status is either <code className="text-[#FF7A18]">Raised</code> or <code className="text-[#FFD23F]">In Progress</code>. Once marked <code className="text-[#3FD0C9]">Resolved</code>, it is permanently excluded from scoring, priority queues, and thermal blobs.
                </p>
              </div>

              <div className="bg-[#0D0A26] rounded-xl p-3.5 border border-[#E9E4FF]/10 space-y-1">
                <span className="text-[#FFD23F] font-bold font-mono text-[11px] uppercase tracking-wider block">
                  Definition: "Hours Pending"
                </span>
                <p className="text-[#A79FD6] leading-relaxed">
                  The continuous elapsed hours since the complaint was submitted: <code className="text-[#E9E4FF]">Math.max(0, (now - submittedAt) / 3,600,000 + timeOffsetHours)</code>. Fast-forwarding time advances hours continuously.
                </p>
              </div>
            </div>

            {/* 1. Formula Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF7A18]" /> 1. Official Baseline Formula (Default)
              </h4>
              <div className="bg-[#0D0A26] rounded-xl p-4 border border-[#E9E4FF]/10 text-xs font-mono space-y-2">
                <p className="text-[#FFD23F] text-sm font-bold">
                  Urgency Score = Category Weight + floor(Hours Pending / 24)
                </p>
                <p className="text-[#A79FD6] text-[11px]">
                  Age score increases by +1 for every full 24-hour block pending. Maximum display scale is 10.
                </p>
              </div>

              {/* Weights Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0D0A26]/80 border border-[#E5237A]/30">
                  <span className="text-[#E5237A] font-bold block">Laboratory</span>
                  <span className="text-[#E9E4FF] font-mono">Weight: 3</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0A26]/80 border border-[#3FD0C9]/30">
                  <span className="text-[#3FD0C9] font-bold block">Wi-Fi</span>
                  <span className="text-[#E9E4FF] font-mono">Weight: 2</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0A26]/80 border border-[#FF7A18]/30">
                  <span className="text-[#FF7A18] font-bold block">Hostel</span>
                  <span className="text-[#E9E4FF] font-mono">Weight: 2</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0D0A26]/80 border border-[#FFD23F]/30">
                  <span className="text-[#FFD23F] font-bold block">Classroom</span>
                  <span className="text-[#E9E4FF] font-mono">Weight: 1</span>
                </div>
              </div>
            </div>

            {/* 2. 5-Step Tie Breaking */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 2. Deterministic 5-Step Tie-Breaking Hierarchy
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#A79FD6] bg-[#0D0A26] rounded-xl p-4 border border-[#E9E4FF]/10 font-sans">
                <li>
                  <strong className="text-[#E9E4FF]">Step 1: Higher Urgency Score</strong> (higher score always ranks first)
                </li>
                <li>
                  <strong className="text-[#E9E4FF]">Tie-Breaker #1:</strong> Longer continuous wait time (or Category Weight if category-first toggled)
                </li>
                <li>
                  <strong className="text-[#E9E4FF]">Tie-Breaker #2:</strong> Higher Category Weight (or wait time if category-first toggled)
                </li>
                <li>
                  <strong className="text-[#E9E4FF]">Tie-Breaker #3:</strong> Untouched status priority (<code className="text-[#FF7A18]">Raised</code> ranks before <code className="text-[#FFD23F]">In Progress</code>)
                </li>
                <li>
                  <strong className="text-[#E9E4FF]">Tie-Breaker #4:</strong> Lexicographical numeric ID order (<code className="text-[#3FD0C9]">C01</code> before <code className="text-[#3FD0C9]">C02</code>)
                </li>
              </ol>
            </div>

            {/* 3. Enhanced SLA Improvement */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FFD23F]" /> 3. Documented Enhanced SLA Formula Toggle
              </h4>
              <div className="bg-[#0D0A26] rounded-xl p-3 border border-[#E9E4FF]/10 text-xs text-[#A79FD6] space-y-1">
                <p className="text-[#E9E4FF]">
                  <strong>Enhanced Score</strong> = Base Score +{' '}
                  <span className="text-[#3FD0C9] font-semibold">+1 (Unattended Raised bonus)</span> +{' '}
                  <span className="text-[#FF7A18] font-semibold">+1 (Critical keyword bonus)</span>
                </p>
                <p className="text-[11px]">
                  Critical keywords detected via whole-word boundaries: fire, spark, short circuit, leak, outage, blackout, exam, broken.
                </p>
              </div>
            </div>

            {/* 4. Live Table of Current Top 3 Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-[#3FD0C9]" /> 4. Live Top-3 Priority Queue Breakdown
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-[#A79FD6]">
                    Active: <span className="text-[#FFD23F] font-bold">{formulaMode}</span> ·{' '}
                    <span className="text-[#3FD0C9] font-bold">{tieBreakOrder}</span>
                  </span>
                </div>
              </div>

              {topQueue.length === 0 ? (
                <div className="bg-[#0D0A26] rounded-xl p-4 text-center text-xs text-[#3FD0C9] border border-[#3FD0C9]/20 font-mono">
                  All clear. No open complaints currently in queue.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E9E4FF]/10 bg-[#0D0A26]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E9E4FF]/10 text-[10px] font-mono text-[#A79FD6] uppercase tracking-wider bg-[#181342]/50">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Arithmetic</th>
                        <th className="py-2.5 px-3">Tie-Break Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E4FF]/5 font-mono">
                      {topQueue.map((item) => {
                        const scoreColor = interpolateThermalColor(item.score)
                        const fontVar = getThermalFontVariation(item.score)
                        const totalHours = Math.round(item.hoursPending)

                        return (
                          <tr key={item.id} className="hover:bg-[#181342]/30 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-[#E9E4FF]">
                              #{item.rank}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#3FD0C9]">
                              {item.id}
                            </td>
                            <td className="py-2.5 px-3 text-[#E9E4FF] font-sans">
                              {item.category}{' '}
                              <span className="text-[#A79FD6] text-[10px]">
                                [Wt {item.categoryWeight}]
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#A79FD6]">
                              {totalHours}h
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === 'Raised'
                                    ? 'bg-[#FF7A18]/20 text-[#FF7A18]'
                                    : 'bg-[#FFD23F]/20 text-[#FFD23F]'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-base" style={{ color: scoreColor, ...fontVar.style }}>
                              {item.score}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#A79FD6]">
                              {item.arithmeticText.replace(/^Score \d+ = /, '')}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-[#FFD23F] font-sans max-w-xs">
                              {item.tieBreakSentence}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-[#E9E4FF]/10">
              <Button
                onClick={onClose}
                className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/85 font-bold text-xs h-9 px-5 cursor-pointer"
              >
                Close Explainer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
