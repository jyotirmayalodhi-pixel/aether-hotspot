import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isSuccess = toast.type === 'success' || !toast.type

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start justify-between gap-3 backdrop-blur-md ${
        isSuccess
          ? 'bg-[#181342]/95 border-[#3FD0C9]/40 text-[#E9E4FF]'
          : 'bg-[#181342]/95 border-[#E5237A]/40 text-[#E9E4FF]'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-[#3FD0C9] shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-[#E5237A] shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs text-[#A79FD6]">{toast.description}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#A79FD6] hover:text-[#E9E4FF] transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
