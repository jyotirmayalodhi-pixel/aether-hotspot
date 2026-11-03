import { motion, AnimatePresence } from 'motion/react'
import { X, HelpCircle, Flame, Layers, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScoringExplainerDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ScoringExplainerDialog({
  isOpen,
  onClose,
}: ScoringExplainerDialogProps) {
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
            className="relative w-full max-w-2xl bg-[#181342] border border-[#E9E4FF]/15 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 max-h-[88vh] overflow-y-auto space-y-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b border-[#E9E4FF]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/30 flex items-center justify-center text-[#3FD0C9]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
                    How Scoring & Priority Works
                  </h3>
                  <p className="text-xs text-[#A79FD6]">
                    Deterministic priority engine with mathematical tie-breaking.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#A79FD6] hover:text-[#E9E4FF] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formula Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF7A18]" /> 1. Official Baseline Formula (Default)
              </h4>
              <div className="bg-[#0D0A26] rounded-xl p-4 border border-[#E9E4FF]/10 text-xs font-mono space-y-2">
                <p className="text-[#FFD23F] text-sm font-bold">
                  Urgency Score = Category Weight + floor(Hours Pending / 24)
                </p>
                <p className="text-[#A79FD6] text-[11px]">
                  Where <strong>Hours Pending</strong> is the continuous elapsed hours since complaint submission (adjusted by the fast-forward time machine).
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

            {/* 5-Step Tie Breaking */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 2. Deterministic 5-Step Tie-Breaking Hierarchy
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#A79FD6] bg-[#0D0A26] rounded-xl p-4 border border-[#E9E4FF]/10">
                <li><strong className="text-[#E9E4FF]">Higher Urgency Score</strong></li>
                <li><strong className="text-[#E9E4FF]">Tie-Breaker #1:</strong> Longer continuous wait time (or Category Weight if toggled)</li>
                <li><strong className="text-[#E9E4FF]">Tie-Breaker #2:</strong> Higher Category Weight (or wait time if toggled)</li>
                <li><strong className="text-[#E9E4FF]">Tie-Breaker #3:</strong> Untouched status priority (<code className="text-[#E5237A]">Raised</code> ranks before <code className="text-[#FFD23F]">In Progress</code>)</li>
                <li><strong className="text-[#E9E4FF]">Tie-Breaker #4:</strong> Lexicographical numeric ID order (<code className="text-[#3FD0C9]">C01</code> before <code className="text-[#3FD0C9]">C02</code>)</li>
              </ol>
            </div>

            {/* Enhanced SLA Improvement */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3FD0C9] font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FFD23F]" /> 3. Documented Enhanced SLA Formula Toggle
              </h4>
              <div className="bg-[#0D0A26] rounded-xl p-3 border border-[#E9E4FF]/10 text-xs text-[#A79FD6] space-y-1">
                <p className="text-[#E9E4FF]">
                  <strong>Enhanced Score</strong> = Base Score + <span className="text-[#3FD0C9]">+1 (Unattended Raised bonus)</span> + <span className="text-[#FF7A18]">+1 (Critical keyword bonus)</span>
                </p>
                <p className="text-[11px]">
                  Critical keywords detected via whole-word boundaries: fire, spark, short circuit, leak, outage, blackout, exam, broken.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={onClose}
                className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/85 font-bold text-xs h-9 px-4 cursor-pointer"
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
