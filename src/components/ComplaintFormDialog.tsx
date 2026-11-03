import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Flame,
  Wifi,
  Building,
  GraduationCap,
  FlaskConical,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateComplaintInput } from '@/domain'
import type { Category } from '@/domain'
import { useComplaintStore } from '@/store'

interface ComplaintFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (complaintId: string) => void
  initialCategory?: Category | ''
  initialDescription?: string
}

const CATEGORIES: Array<{
  category: Category
  weight: number
  icon: typeof Wifi
  color: string
}> = [
  { category: 'Wi-Fi', weight: 2, icon: Wifi, color: '#3FD0C9' },
  { category: 'Hostel', weight: 2, icon: Building, color: '#FF7A18' },
  { category: 'Classroom', weight: 1, icon: GraduationCap, color: '#FFD23F' },
  { category: 'Laboratory', weight: 3, icon: FlaskConical, color: '#E5237A' },
]

const QUICK_CHIPS = [
  {
    label: 'Lab 2 oscilloscope ground fault',
    category: 'Laboratory' as Category,
    description:
      'Oscilloscope workbench ground fault and microscope lamp failure at Station 3 in Lab 2.',
  },
  {
    label: 'Hostel B hot water geyser dead',
    category: 'Hostel' as Category,
    description:
      'Hot water geyser and drinking water cooler not working on the second floor of Hostel Block B.',
  },
  {
    label: 'Library Wi-Fi dropping packets',
    category: 'Wi-Fi' as Category,
    description:
      'Wi-Fi keeps dropping every few minutes in the library reading hall and main academic block.',
  },
]

export function ComplaintFormDialog({
  isOpen,
  onClose,
  onSuccess,
  initialCategory = '',
  initialDescription = '',
}: ComplaintFormDialogProps) {
  const addComplaint = useComplaintStore((state) => state.addComplaint)

  const [category, setCategory] = useState<Category | ''>(initialCategory)
  const [description, setDescription] = useState<string>(initialDescription)
  const [initialHoursAgo, setInitialHoursAgo] = useState<number>(0)
  const [errors, setErrors] = useState<{
    category?: string
    description?: string
    initialHoursAgo?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const hoursRef = useRef<HTMLInputElement>(null)

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory)
      setDescription(initialDescription)
      setInitialHoursAgo(0)
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, initialCategory, initialDescription])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleQuickChip = (chip: (typeof QUICK_CHIPS)[0]) => {
    setCategory(chip.category)
    setDescription(chip.description)
    // Clear existing error for these fields
    setErrors((prev) => ({
      ...prev,
      category: undefined,
      description: undefined,
    }))
    if (descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const validation = validateComplaintInput(category, description, initialHoursAgo)

    if (!validation.isValid) {
      setErrors(validation.errors)

      // Focus first invalid field
      if (validation.errors.category && categoryRef.current) {
        categoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (validation.errors.description && descriptionRef.current) {
        descriptionRef.current.focus()
      } else if (validation.errors.initialHoursAgo && hoursRef.current) {
        hoursRef.current.focus()
      }
      return
    }

    setIsSubmitting(true)

    try {
      const created = addComplaint({
        category: category as Category,
        description: description.trim(),
        initialHoursAgo,
      })

      onClose()
      onSuccess(created.id)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#181342] border border-[#E9E4FF]/15 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto z-10 flex flex-col gap-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-dialog-title"
          >
            {/* Sheet Handle on Mobile */}
            <div className="w-12 h-1.5 bg-[#E9E4FF]/20 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

            {/* Dialog Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#E9E4FF]/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3FD0C9]/15 text-[#3FD0C9] border border-[#3FD0C9]/30">
                  <Flame className="w-3.5 h-3.5 text-[#FF7A18]" />
                  <span>Campus Incident Logger</span>
                </div>
                <h2
                  id="complaint-dialog-title"
                  className="text-2xl font-bold tracking-tight text-[#E9E4FF] font-['Anybody_Variable',sans-serif]"
                >
                  Report an issue
                </h2>
                <p className="text-xs text-[#A79FD6]">
                  Every open complaint heats the campus thermal map and recalculates priority automatically.
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-[#A79FD6] hover:text-[#E9E4FF] p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Fill Chips */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#A79FD6]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD23F]" />
                <span>1-Click Quick Issue Chips (Instant Live Demo Fill):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleQuickChip(chip)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0D0A26] border border-[#E9E4FF]/12 hover:border-[#3FD0C9]/50 hover:bg-[#1F1A52] text-[#E9E4FF] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
                  >
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E9E4FF]/10 group-hover:text-[#3FD0C9]">
                      {chip.category}
                    </span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selector */}
              <div ref={categoryRef} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#E9E4FF] font-mono">
                    Category <span className="text-[#E5237A]">*</span>
                  </label>
                  {errors.category && (
                    <span className="text-xs text-[#E5237A] flex items-center gap-1 font-medium animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.category}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.category
                    return (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => {
                          setCategory(cat.category)
                          setErrors((prev) => ({ ...prev, category: undefined }))
                        }}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1A52] border-[#3FD0C9] ring-2 ring-[#3FD0C9]/40 shadow-lg'
                            : 'bg-[#0D0A26]/80 border-[#E9E4FF]/12 hover:border-[#E9E4FF]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${cat.color}25`,
                              color: cat.color,
                            }}
                          >
                            Weight {cat.weight}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#E9E4FF]">
                          {cat.category}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="complaint-description"
                    className="text-xs font-bold uppercase tracking-wider text-[#E9E4FF] font-mono"
                  >
                    What's wrong? <span className="text-[#E5237A]">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {errors.description && (
                      <span className="text-xs text-[#E5237A] flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.description}
                      </span>
                    )}
                    <span
                      className={`text-xs font-mono ${
                        description.trim().length < 10
                          ? 'text-[#A79FD6]'
                          : description.trim().length > 280
                            ? 'text-[#E5237A]'
                            : 'text-[#3FD0C9]'
                      }`}
                    >
                      {description.trim().length} / 280
                    </span>
                  </div>
                </div>

                <textarea
                  id="complaint-description"
                  ref={descriptionRef}
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: undefined }))
                    }
                  }}
                  placeholder="Describe the problem clearly (e.g. Broken router in library reading room dropping packets during evening peak hours)..."
                  className="w-full bg-[#0D0A26] border border-[#E9E4FF]/15 rounded-xl p-3 text-sm text-[#E9E4FF] placeholder:text-[#A79FD6]/50 focus:outline-none focus:border-[#3FD0C9] focus:ring-1 focus:ring-[#3FD0C9] transition-all resize-none font-sans"
                />
              </div>

              {/* Optional Judge Test Field: Simulate initial age */}
              <div className="p-4 rounded-xl bg-[#0D0A26]/80 border border-[#E9E4FF]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#E9E4FF] uppercase tracking-wider font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#3FD0C9]" />
                    <span>Judge Test: Simulate Initial Age</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#3FD0C9]">
                    +{Math.floor(initialHoursAgo / 24)} days ({initialHoursAgo}h)
                  </span>
                </div>

                <p className="text-[11px] text-[#A79FD6] leading-relaxed">
                  Submit a complaint as already having aged (0 to 240 hours) to test how age adds <code className="text-[#3FD0C9] font-mono">floor(H / 24)</code> points instantly upon submission.
                </p>

                <div className="flex items-center gap-4">
                  <input
                    ref={hoursRef}
                    type="range"
                    min="0"
                    max="240"
                    step="1"
                    value={initialHoursAgo}
                    onChange={(e) => {
                      setInitialHoursAgo(Number(e.target.value))
                      if (errors.initialHoursAgo) {
                        setErrors((prev) => ({ ...prev, initialHoursAgo: undefined }))
                      }
                    }}
                    className="w-full accent-[#3FD0C9] h-2 bg-[#181342] rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={initialHoursAgo}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setInitialHoursAgo(Number.isNaN(val) ? 0 : val)
                      }}
                      className="w-16 bg-[#181342] border border-[#E9E4FF]/20 rounded-lg px-2 py-1 text-xs font-mono text-[#E9E4FF] text-center"
                    />
                    <span className="text-xs font-mono text-[#A79FD6]">hrs</span>
                  </div>
                </div>

                {errors.initialHoursAgo && (
                  <p className="text-xs text-[#E5237A] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.initialHoursAgo}
                  </p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="bg-[#0D0A26] border border-[#E9E4FF]/15 text-[#E9E4FF] hover:bg-white/5 cursor-pointer text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/90 font-bold text-xs h-10 px-5 shadow-lg shadow-[#3FD0C9]/20 cursor-pointer disabled:opacity-50"
                >
                  <Flame className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? 'Logging Issue...' : 'Submit Incident'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
