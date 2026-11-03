import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Clock,
  Filter,
  CheckCircle2,
  Play,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { ComplaintFormDialog } from '@/components/ComplaintFormDialog'
import { ScoringExplainerDialog } from '@/components/ScoringExplainerDialog'
import { ConfirmResetDialog } from '@/components/ConfirmResetDialog'
import { ToastContainer, type ToastMessage } from '@/components/Toast'
import { Button } from '@/components/ui/button'
import { useComplaintStore, useStoreSync } from '@/store'
import type { Category } from '@/domain'

export default function App() {
  // Sync time every 30s and rehydrate across tabs on focus
  useStoreSync()

  const complaints = useComplaintStore((state) => state.complaints)
  const advanceStatus = useComplaintStore((state) => state.advanceStatus)
  const resetToSeedData = useComplaintStore((state) => state.resetToSeedData)
  const searchQuery = useComplaintStore((state) => state.searchQuery)

  // Dialog states
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isExplainerOpen, setIsExplainerOpen] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [initialFormCategory, setInitialFormCategory] = useState<Category | ''>('')
  const [initialFormDescription, setInitialFormDescription] = useState<string>('')

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (msg: {
    title: string
    description?: string
    type?: 'success' | 'error' | 'info'
  }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setToasts((prev) => [...prev, { id, ...msg }])
  }

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Trigger invalid form demo: opens form with category empty and 9-char description
  const handleTriggerInvalidFormDemo = () => {
    setInitialFormCategory('')
    setInitialFormDescription('Broken AP') // exactly 9 chars (< 10)
    setIsReportOpen(true)
    addToast({
      title: 'Invalid Form Demo Triggered',
      description: 'Form prefilled with empty category and 9-character description to demonstrate inline validation.',
      type: 'info',
    })
  }

  const handleOpenNormalReport = () => {
    setInitialFormCategory('')
    setInitialFormDescription('')
    setIsReportOpen(true)
  }

  const handleComplaintSubmitted = (complaintId: string) => {
    addToast({
      title: `Reported as ${complaintId}`,
      description: `Reported as ${complaintId}. It's in the queue.`,
      type: 'success',
    })
  }

  // Filter complaints based on search query
  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#0D0A26] text-[#E9E4FF] font-['Instrument_Sans_Variable',sans-serif] selection:bg-[#3FD0C9]/30 selection:text-[#E9E4FF] px-4 py-8 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Header
          onOpenReportDialog={handleOpenNormalReport}
          onOpenExplainerDialog={() => setIsExplainerOpen(true)}
          onTriggerInvalidFormDemo={handleTriggerInvalidFormDemo}
          onRequestResetConfirmation={() => setIsResetConfirmOpen(true)}
          onToast={addToast}
        />

        {/* Temporary Stored Complaints Inspection Section (Block B3) */}
        <section className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9E4FF]/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold text-[#3FD0C9] px-2 py-0.5 rounded bg-[#3FD0C9]/15 border border-[#3FD0C9]/30">
                  Block B3 Verification
                </span>
                <span className="text-xs text-[#A79FD6]">
                  Live Store Telemetry & Persistence Verifier
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif] mt-1">
                Stored Campus Complaints ({complaints.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#A79FD6]">
                Showing {filteredComplaints.length} of {complaints.length} records
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenNormalReport}
                className="bg-[#0D0A26] border border-[#3FD0C9]/40 text-[#3FD0C9] hover:bg-[#3FD0C9]/10 text-xs h-8 cursor-pointer"
              >
                + Add Another
              </Button>
            </div>
          </div>

          {/* List of Complaints */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-[#0D0A26]/60 border border-dashed border-[#E9E4FF]/15 space-y-3">
              <Filter className="w-8 h-8 text-[#A79FD6] mx-auto opacity-50" />
              <p className="text-sm text-[#A79FD6]">
                No complaints found matching "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredComplaints.map((c) => {
                  const hoursAgo = Math.max(
                    0,
                    Math.round((Date.now() - c.submittedAt) / 3600000)
                  )
                  const daysAgo = Math.floor(hoursAgo / 24)

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      layout
                      className="bg-[#0D0A26]/80 hover:bg-[#0D0A26] rounded-xl border border-[#E9E4FF]/10 hover:border-[#E9E4FF]/25 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* ID Badge */}
                        <div className="w-12 h-12 rounded-xl bg-[#181342] border border-[#E9E4FF]/15 flex items-center justify-center shrink-0">
                          <span className="font-mono font-bold text-sm text-[#E9E4FF]">
                            {c.id}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Category Chip */}
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E9E4FF]/10 text-[#E9E4FF] border border-[#E9E4FF]/15">
                              {c.category}
                            </span>

                            {/* Status Badge */}
                            {c.status === 'Raised' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E5237A]/15 text-[#E5237A] border border-[#E5237A]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E5237A] animate-pulse" />
                                Raised
                              </span>
                            )}
                            {c.status === 'In Progress' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFD23F]/15 text-[#FFD23F] border border-[#FFD23F]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD23F]" />
                                In Progress
                              </span>
                            )}
                            {c.status === 'Resolved' && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#3FD0C9]/15 text-[#3FD0C9] border border-[#3FD0C9]/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Resolved
                              </span>
                            )}

                            {/* Age */}
                            <span className="text-xs text-[#A79FD6] flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {daysAgo > 0 ? `${daysAgo}d ${hoursAgo % 24}h` : `${hoursAgo}h`} ({hoursAgo}h ago)
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-[#E9E4FF] leading-snug">
                            {c.description}
                          </p>
                        </div>
                      </div>

                      {/* Forward Action Button */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {c.status === 'Raised' && (
                          <Button
                            size="sm"
                            onClick={() => advanceStatus(c.id)}
                            className="bg-[#261F63] hover:bg-[#322982] text-xs text-[#E9E4FF] border border-[#E9E4FF]/15 cursor-pointer h-8"
                          >
                            <Play className="w-3.5 h-3.5 mr-1 text-[#3FD0C9]" /> Start work
                          </Button>
                        )}
                        {c.status === 'In Progress' && (
                          <Button
                            size="sm"
                            onClick={() => advanceStatus(c.id)}
                            className="bg-[#3FD0C9]/15 hover:bg-[#3FD0C9]/25 text-xs text-[#3FD0C9] border border-[#3FD0C9]/30 cursor-pointer h-8"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark resolved
                          </Button>
                        )}
                        {c.status === 'Resolved' && (
                          <span className="text-xs font-mono text-[#3FD0C9]/80 px-2.5 py-1 rounded bg-[#3FD0C9]/10">
                            Completed
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Dialogs */}
        <ComplaintFormDialog
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          onSuccess={handleComplaintSubmitted}
          initialCategory={initialFormCategory}
          initialDescription={initialFormDescription}
        />

        <ScoringExplainerDialog
          isOpen={isExplainerOpen}
          onClose={() => setIsExplainerOpen(false)}
        />

        <ConfirmResetDialog
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={() => {
            resetToSeedData()
            addToast({
              title: 'Reset to PDF Seed',
              description: 'Restored fresh C01–C04 seed records relative to now.',
              type: 'info',
            })
          }}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </div>
  )
}
