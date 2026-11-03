import {
  RotateCcw,
  FastForward,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplaintStore } from '@/store'

export function TimeMachineBar() {
  const timeOffsetHours = useComplaintStore((state) => state.timeOffsetHours)
  const setTimeOffsetHours = useComplaintStore((state) => state.setTimeOffsetHours)

  const quickOffsets = [
    { label: 'Now', hours: 0 },
    { label: '+24h', hours: 24 },
    { label: '+48h', hours: 48 },
    { label: '+72h', hours: 72 },
    { label: '+168h (1wk)', hours: 168 },
  ]

  return (
    <div className="space-y-3">
      {/* Simulation Banner when fast-forward is active */}
      {timeOffsetHours > 0 && (
        <div className="bg-gradient-to-r from-[#FF7A18]/20 via-[#FFD23F]/20 to-[#FF7A18]/20 border border-[#FFD23F]/40 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/20 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FFD23F] shrink-0 animate-bounce" />
            <div className="text-xs text-[#E9E4FF]">
              <strong className="text-[#FFD23F] font-mono">
                Simulation Active: Showing +{timeOffsetHours}h ahead.
              </strong>{' '}
              <span className="text-[#A79FD6]">
                Urgency scores & thermal map are fast-forwarded. Your stored data is 100% unchanged.
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setTimeOffsetHours(0)}
            className="bg-[#FFD23F] text-[#0D0A26] hover:bg-[#FFD23F]/90 font-bold text-xs h-7 px-3 shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Back to now
          </Button>
        </div>
      )}

      {/* Main Time Machine Controls Strip */}
      <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-4 md:px-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Explanation */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3FD0C9]/15 border border-[#3FD0C9]/30 flex items-center justify-center text-[#3FD0C9]">
            <FastForward className="w-4 h-4 text-[#3FD0C9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
                Fast-Forward Time Machine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3FD0C9]/15 text-[#3FD0C9] border border-[#3FD0C9]/30">
                Transient
              </span>
            </div>
            <p className="text-[11px] text-[#A79FD6]">
              Simulate unattended aging to test priority ranking & SLA escalation over time.
            </p>
          </div>
        </div>

        {/* Center/Right: Slider & Quick Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 flex-1 max-w-xl">
          {/* Slider with Value readout */}
          <div className="flex items-center gap-3 w-full">
            <span className="font-mono text-xs text-[#A79FD6] min-w-[28px]">0h</span>
            <input
              type="range"
              min="0"
              max="168"
              step="1"
              value={timeOffsetHours}
              onChange={(e) => setTimeOffsetHours(parseInt(e.target.value, 10))}
              aria-label="Fast-forward slider in hours"
              className="w-full h-2 bg-[#0D0A26] rounded-lg appearance-none cursor-pointer accent-[#3FD0C9] border border-[#E9E4FF]/15"
            />
            <span className="font-mono text-xs text-[#A79FD6] min-w-[36px]">168h</span>

            <div className="px-2.5 py-1 rounded-lg bg-[#0D0A26] border border-[#E9E4FF]/15 min-w-[64px] text-center font-mono text-xs font-bold text-[#3FD0C9]">
              +{timeOffsetHours}h
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {quickOffsets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setTimeOffsetHours(preset.hours)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeOffsetHours === preset.hours
                    ? 'bg-[#3FD0C9] text-[#0D0A26] shadow-sm'
                    : 'bg-[#0D0A26] text-[#A79FD6] hover:text-[#E9E4FF] border border-[#E9E4FF]/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
