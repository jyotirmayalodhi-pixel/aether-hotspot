import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Papa from 'papaparse'
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplaintStore } from '@/store'
import { getHoursPending, scoreComplaint } from '@/domain'
import type { Category, Status } from '@/domain'

interface DataImportModalProps {
  isOpen: boolean
  onClose: () => void
  onToast: (msg: {
    title: string
    description?: string
    type?: 'success' | 'error' | 'info'
  }) => void
}

export function DataImportModal({
  isOpen,
  onClose,
  onToast,
}: DataImportModalProps) {
  const complaints = useComplaintStore((state) => state.complaints)
  const importComplaints = useComplaintStore((state) => state.importComplaints)

  const [rawText, setRawText] = useState('')
  const [importResult, setImportResult] = useState<{
    added: number
    rejected: number
    renamed: number
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const normalizeParsedItems = (items: any[]): any[] => {
    const now = Date.now()
    return items.map((row) => {
      // Handle both uppercase/lowercase keys
      const id = String(row.id || row.ID || '').trim()
      const category = (row.category || row.Category || '').trim() as Category
      const description = String(row.description || row.Description || '').trim()
      let status = (row.status || row.Status || 'Raised').trim() as Status
      if (!['Raised', 'In Progress', 'Resolved'].includes(status)) {
        status = 'Raised'
      }

      let submittedAt = Number(row.submittedAt || row.SubmittedAt)
      if (isNaN(submittedAt) || submittedAt <= 0) {
        const hoursAgo = Number(row.hoursAgo || row.hoursPending || row.Submitted || 0)
        submittedAt = now - Math.max(0, hoursAgo) * 3600000
      }

      let updatedAt = Number(row.updatedAt || row.UpdatedAt)
      if (isNaN(updatedAt) || updatedAt <= 0) {
        updatedAt = now
      }

      const history = Array.isArray(row.history)
        ? row.history
        : [{ from: null, to: status, changedAt: submittedAt }]

      return {
        id,
        category,
        description,
        status,
        submittedAt,
        updatedAt,
        history,
      }
    })
  }

  const handleProcessImport = () => {
    setErrorMsg(null)
    setImportResult(null)

    const trimmed = rawText.trim()
    if (!trimmed) {
      setErrorMsg('Please enter or upload CSV or JSON data.')
      return
    }

    try {
      let rawObjects: any[] = []

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        // Parse JSON
        const parsed = JSON.parse(trimmed)
        rawObjects = Array.isArray(parsed) ? parsed : [parsed]
      } else {
        // Parse CSV using PapaParse
        const result = Papa.parse(trimmed, {
          header: true,
          skipEmptyLines: true,
        })
        if (result.errors && result.errors.length > 0 && result.data.length === 0) {
          throw new Error(result.errors[0].message)
        }
        rawObjects = result.data
      }

      const normalized = normalizeParsedItems(rawObjects)
      const outcome = importComplaints(normalized)
      setImportResult(outcome)

      if (outcome.added > 0) {
        onToast({
          title: `Imported ${outcome.added} Record${outcome.added > 1 ? 's' : ''}`,
          description: `Successfully added ${outcome.added} complaints (${outcome.renamed} renamed for uniqueness, ${outcome.rejected} rejected).`,
          type: 'success',
        })
      } else {
        setErrorMsg(`All ${outcome.rejected} items failed validation. Verify required fields: category, description (min 10 chars).`)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse data format. Please check JSON/CSV syntax.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setRawText(content || '')
    }
    reader.readAsText(file)
  }

  // 1-Click Export CSV
  const handleExportCSV = () => {
    const now = Date.now()
    const exportRows = complaints.map((c) => {
      const calc = scoreComplaint(c, now)
      return {
        id: c.id,
        category: c.category,
        status: c.status,
        urgencyScore: calc ? calc.score : 'Resolved',
        hoursPending: Math.round(getHoursPending(c.submittedAt, now)),
        description: c.description,
        submittedAt: new Date(c.submittedAt).toISOString(),
        updatedAt: new Date(c.updatedAt).toISOString(),
      }
    })

    const csvString = Papa.unparse(exportRows)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aether_hotspot_complaints_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    onToast({
      title: 'CSV Export Generated',
      description: `Exported ${complaints.length} records to CSV.`,
      type: 'info',
    })
  }

  // 1-Click Export JSON
  const handleExportJSON = () => {
    const jsonString = JSON.stringify(complaints, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aether_hotspot_complaints_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)

    onToast({
      title: 'JSON Export Generated',
      description: `Exported ${complaints.length} records to JSON.`,
      type: 'info',
    })
  }

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
            className="relative w-full max-w-2xl bg-[#181342] border border-[#E9E4FF]/15 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E9E4FF]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/30 flex items-center justify-center text-[#3FD0C9]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
                    Data Import & Export Center
                  </h3>
                  <p className="text-xs text-[#A79FD6]">
                    Shape-safe CSV/JSON batch ingest with automatic ID collision protection.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#A79FD6] hover:text-[#E9E4FF] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Section */}
            <div className="bg-[#0D0A26] rounded-xl p-4 border border-[#E9E4FF]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono text-[#3FD0C9] uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#3FD0C9]" /> 1. Export Current Data ({complaints.length} records)
                  </h4>
                  <p className="text-[11px] text-[#A79FD6]">
                    Download full dataset with scores and continuous wait metrics.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportCSV}
                    className="bg-[#261F63] hover:bg-[#322982] text-xs text-[#E9E4FF] border border-[#E9E4FF]/20 cursor-pointer h-8"
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExportJSON}
                    className="bg-[#261F63] hover:bg-[#322982] text-xs text-[#E9E4FF] border border-[#E9E4FF]/20 cursor-pointer h-8"
                  >
                    Export JSON
                  </Button>
                </div>
              </div>
            </div>

            {/* Import Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-[#FFD23F] uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#FFD23F]" /> 2. Batch Ingest (CSV or JSON)
                </h4>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#0D0A26] hover:bg-[#140F38] text-xs text-[#3FD0C9] border border-[#3FD0C9]/30 h-7 px-3 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Textarea for paste */}
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='Paste CSV or JSON here...\nExample CSV:\nid,category,description,hoursAgo,status\nC90,Wi-Fi,"Hostel C wireless bridge down",48,Raised'
                className="w-full h-36 bg-[#0D0A26] border border-[#E9E4FF]/15 rounded-xl p-3 text-xs font-mono text-[#E9E4FF] focus:outline-none focus:border-[#3FD0C9] resize-none"
              />

              {/* Error readout */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#E5237A]/15 border border-[#E5237A]/30 text-xs text-[#E5237A] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Result readout */}
              {importResult && (
                <div className="p-3 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/30 text-xs text-[#3FD0C9] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Batch Ingest Complete: <strong>{importResult.added}</strong> added,{' '}
                      <strong>{importResult.renamed}</strong> renamed,{' '}
                      <strong>{importResult.rejected}</strong> rejected.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E9E4FF]/10">
              <span className="text-[11px] text-[#A79FD6]">
                Every imported item is shape-validated by the domain engine.
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs text-[#A79FD6] hover:text-[#E9E4FF] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessImport}
                  className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/85 font-bold text-xs h-9 px-5 cursor-pointer shadow-md"
                >
                  Process & Import
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
