import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmResetDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmResetDialog({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmResetDialogProps) {
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
            className="relative w-full max-w-md bg-[#181342] border border-[#FF7A18]/30 rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A18]/15 border border-[#FF7A18]/30 flex items-center justify-center text-[#FF7A18]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={onClose}
                className="text-[#A79FD6] hover:text-[#E9E4FF] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
                Reset to PDF Seed Dataset?
              </h3>
              <p className="text-xs text-[#A79FD6] leading-relaxed">
                This will restore the 4 fresh seed complaints (<strong>C01, C02, C03, C04</strong>) with exact fresh timestamps relative to current time, removing any newly added test complaints.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E4FF]/10">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-[#0D0A26] border border-[#E9E4FF]/15 text-[#E9E4FF] hover:bg-white/5 text-xs h-9 px-3 cursor-pointer"
              >
                Keep Current Data
              </Button>
              <Button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="bg-[#FF7A18] hover:bg-[#FF7A18]/85 text-[#0D0A26] font-bold text-xs h-9 px-4 cursor-pointer"
              >
                Confirm Reset
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
