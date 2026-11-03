import { useState, useRef, useEffect } from 'react'
import {
  Flame,
  Search,
  X,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Zap,
  AlertTriangle,
  PlusCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplaintStore } from '@/store'

interface HeaderProps {
  onOpenReportDialog: () => void
  onOpenExplainerDialog: () => void
  onTriggerInvalidFormDemo: () => void
  onRequestResetConfirmation: () => void
  onToast: (msg: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => void
}

export function Header({
  onOpenReportDialog,
  onOpenExplainerDialog,
  onTriggerInvalidFormDemo,
  onRequestResetConfirmation,
  onToast,
}: HeaderProps) {
  const searchQuery = useComplaintStore((state) => state.searchQuery)
  const setSearchQuery = useComplaintStore((state) => state.setSearchQuery)
  const storageRecoveredNotice = useComplaintStore(
    (state) => state.storageRecoveredNotice
  )
  const dismissStorageRecoveredNotice = useComplaintStore(
    (state) => state.dismissStorageRecoveredNotice
  )
  const injectTieBreakDemo = useComplaintStore(
    (state) => state.injectTieBreakDemo
  )

  const [judgeMenuOpen, setJudgeMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Click outside to close Judge Tools dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setJudgeMenuOpen(false)
      }
    }
    if (judgeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [judgeMenuOpen])

  const handleInjectTieBreak = () => {
    setJudgeMenuOpen(false)
    injectTieBreakDemo()
    onToast({
      title: 'Tie-Break Demo Injected',
      description: 'Added 2 unresolved complaints with tied Score 4 to demonstrate live re-ranking.',
      type: 'info',
    })
  }

  const handleTriggerInvalidForm = () => {
    setJudgeMenuOpen(false)
    onTriggerInvalidFormDemo()
  }

  return (
    <header className="space-y-4">
      {/* Calm Recovery Banner if storage was damaged or recovered */}
      {storageRecoveredNotice && (
        <div className="bg-[#181342] border border-[#3FD0C9]/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#E9E4FF] shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#3FD0C9] shrink-0" />
            <span>
              Saved data was damaged or outdated and has been reset to the demo dataset.
            </span>
          </div>
          <button
            onClick={dismissStorageRecoveredNotice}
            className="text-[#A79FD6] hover:text-[#E9E4FF] p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E9E4FF]/12 pb-5">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#2A1B8C] via-[#E5237A] to-[#FF7A18] shadow-lg shadow-[#E5237A]/25 border border-white/20">
            <Flame className="w-6 h-6 text-white drop-shadow animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Anybody_Variable',sans-serif] font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#E9E4FF] via-[#3FD0C9] to-[#FFD23F]">
                HOTSPOT
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[#3FD0C9]/15 text-[#3FD0C9] border border-[#3FD0C9]/30">
                V3 Live
              </span>
            </div>
            <p className="text-xs text-[#A79FD6] tracking-tight">
              Campus issues, ranked by how hot they're running.
            </p>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A79FD6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, issue, category..."
              className="w-full bg-[#181342] border border-[#E9E4FF]/15 rounded-xl pl-9 pr-8 py-2 text-xs text-[#E9E4FF] placeholder:text-[#A79FD6]/50 focus:outline-none focus:border-[#3FD0C9] focus:ring-1 focus:ring-[#3FD0C9] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A79FD6] hover:text-[#E9E4FF] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* "How scoring works" Button */}
          <Button
            variant="secondary"
            onClick={onOpenExplainerDialog}
            className="bg-[#181342] text-[#E9E4FF] border border-[#E9E4FF]/15 hover:bg-[#261F63] hover:text-[#3FD0C9] text-xs h-9 px-3 cursor-pointer transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-[#3FD0C9]" />
            <span>How scoring works</span>
          </Button>

          {/* "Judge Tools ▾" Dropdown Menu */}
          <div ref={menuRef} className="relative">
            <Button
              variant="secondary"
              onClick={() => setJudgeMenuOpen(!judgeMenuOpen)}
              className="bg-[#181342] text-[#E9E4FF] border border-[#E9E4FF]/15 hover:bg-[#261F63] text-xs h-9 px-3 cursor-pointer transition-all flex items-center gap-1.5"
              aria-haspopup="true"
              aria-expanded={judgeMenuOpen}
            >
              <span>Judge Tools</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#A79FD6]" />
            </Button>

            {judgeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#181342] border border-[#E9E4FF]/20 rounded-xl shadow-2xl p-1.5 z-40 space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-mono font-bold text-[#A79FD6] border-b border-[#E9E4FF]/10">
                  Hackathon Evaluation Boosters
                </div>

                <button
                  onClick={() => {
                    setJudgeMenuOpen(false)
                    onRequestResetConfirmation()
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#E9E4FF] hover:bg-[#261F63] hover:text-[#FF7A18] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#FF7A18]" />
                  <span>Reset to PDF Seed (C01–C04)</span>
                </button>

                <button
                  onClick={handleInjectTieBreak}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#E9E4FF] hover:bg-[#261F63] hover:text-[#3FD0C9] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <Zap className="w-3.5 h-3.5 text-[#3FD0C9]" />
                  <span>Inject Tie-Break Demo</span>
                </button>

                <button
                  onClick={handleTriggerInvalidForm}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#E9E4FF] hover:bg-[#261F63] hover:text-[#E5237A] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E5237A]" />
                  <span>Trigger Invalid Form Demo</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary "Report an issue" Button */}
          <Button
            onClick={onOpenReportDialog}
            className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/85 font-bold text-xs h-9 px-4 shadow-lg shadow-[#3FD0C9]/20 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Report an issue</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
