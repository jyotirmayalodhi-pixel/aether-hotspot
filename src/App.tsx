import { useState } from 'react'
import { Header } from '@/components/Header'
import { SummaryStrip } from '@/components/SummaryStrip'
import { PriorityQueue } from '@/components/PriorityQueue'
import { FilterBar } from '@/components/FilterBar'
import { ComplaintList } from '@/components/ComplaintList'
import { ComplaintFormDialog } from '@/components/ComplaintFormDialog'
import { ScoringExplainerDialog } from '@/components/ScoringExplainerDialog'
import { ConfirmResetDialog } from '@/components/ConfirmResetDialog'
import { ToastContainer, type ToastMessage } from '@/components/Toast'
import { useComplaintStore, useStoreSync } from '@/store'
import type { Category } from '@/domain'

export default function App() {
  // Synchronize time every 30s & rehydrate on focus
  useStoreSync()

  const resetToSeedData = useComplaintStore((state) => state.resetToSeedData)

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

  // Judge tool: trigger invalid form demo (prefilled with invalid data)
  const handleTriggerInvalidFormDemo = () => {
    setInitialFormCategory('')
    setInitialFormDescription('Broken AP') // exactly 9 chars (< 10)
    setIsReportOpen(true)
    addToast({
      title: 'Invalid Form Demo Triggered',
      description:
        'Form prefilled with empty category and 9-character description to demonstrate inline validation.',
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

  return (
    <div className="min-h-screen bg-[#0D0A26] text-[#E9E4FF] font-['Instrument_Sans_Variable',sans-serif] selection:bg-[#3FD0C9]/30 selection:text-[#E9E4FF] px-4 py-8 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header
          onOpenReportDialog={handleOpenNormalReport}
          onOpenExplainerDialog={() => setIsExplainerOpen(true)}
          onTriggerInvalidFormDemo={handleTriggerInvalidFormDemo}
          onRequestResetConfirmation={() => setIsResetConfirmOpen(true)}
          onToast={addToast}
        />

        {/* 1. Summary Telemetry Strip (Block B4) */}
        <SummaryStrip />

        {/* 2. "Hottest right now" Top-3 Priority Queue (Block B5) */}
        <PriorityQueue />

        {/* 3. Combined Search & Filter Bar (Block B4) */}
        <FilterBar />

        {/* 3. Interactive Complaint List (Block B4) */}
        <ComplaintList onOpenReportDialog={handleOpenNormalReport} />

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
              title: 'Reset to PDF Seed Data',
              description:
                'Fresh timestamps (C01: 48h, C02: 8h, C03: 72h, C04: 24h) restored.',
              type: 'info',
            })
          }}
        />

        {/* Floating Toasts */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </div>
  )
}
