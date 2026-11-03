import { useEffect, useRef, useMemo } from 'react'
import {
  Flame,
  CheckCircle2,
} from 'lucide-react'
import { useComplaintStore } from '@/store'
import { scoreComplaint } from '@/domain'
import type { Category } from '@/domain'
import {
  getThermalLookupTable,
  interpolateThermalColor,
} from '@/lib/thermal'

const ZONE_BOUNDS: Record<
  Category,
  { minX: number; maxX: number; minY: number; maxY: number; title: string; subtitle: string }
> = {
  'Wi-Fi': {
    minX: 50,
    maxX: 470,
    minY: 45,
    maxY: 265,
    title: 'Wi-Fi Network Core',
    subtitle: 'Central Library & Telecom Hub',
  },
  'Hostel': {
    minX: 530,
    maxX: 950,
    minY: 45,
    maxY: 265,
    title: 'Hostel Towers',
    subtitle: 'Residential Blocks A-D',
  },
  'Classroom': {
    minX: 50,
    maxX: 470,
    minY: 315,
    maxY: 535,
    title: 'Academic Classrooms',
    subtitle: 'Lecture Halls & Auditoriums',
  },
  'Laboratory': {
    minX: 530,
    maxX: 950,
    minY: 315,
    maxY: 535,
    title: 'Laboratory Wing',
    subtitle: 'Engineering & Science Labs',
  },
}

function getComplaintCoordinates(id: string, category: Category) {
  const zone = ZONE_BOUNDS[category]
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  const hash = Math.abs(h)
  const padX = 60
  const padY = 50
  const usableW = zone.maxX - zone.minX - padX * 2
  const usableH = zone.maxY - zone.minY - padY * 2
  const svgX = zone.minX + padX + ((hash % 1000) / 1000) * usableW
  const svgY = zone.minY + padY + (((hash >> 3) % 1000) / 1000) * usableH
  const offX = Math.round(svgX * 0.25)
  const offY = Math.round(svgY * 0.25)
  return { svgX, svgY, offX, offY }
}

export function CampusThermalMap() {
  const complaints = useComplaintStore((state) => state.complaints)
  const timeOffsetHours = useComplaintStore((state) => state.timeOffsetHours)
  const formulaMode = useComplaintStore((state) => state.formulaMode)
  const setCategoryFilter = useComplaintStore((state) => state.setCategoryFilter)
  const setStatusFilter = useComplaintStore((state) => state.setStatusFilter)
  const setSearchQuery = useComplaintStore((state) => state.setSearchQuery)
  const selectedComplaintId = useComplaintStore(
    (state) => state.selectedComplaintId
  )
  const setSelectedComplaintId = useComplaintStore(
    (state) => state.setSelectedComplaintId
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Initialize offscreen canvas once
  if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
    const off = document.createElement('canvas')
    off.width = 250
    off.height = 150
    offscreenCanvasRef.current = off
  }

  const nowMs = Date.now()

  // Compute scored unresolved complaints
  const unresolvedWithScores = useMemo(() => {
    return complaints
      .filter((c) => c.status !== 'Resolved')
      .map((c) => {
        const calculation = scoreComplaint(c, nowMs, timeOffsetHours, formulaMode)
        const coords = getComplaintCoordinates(c.id, c.category)
        return {
          complaint: c,
          score: calculation ? calculation.score : 0,
          heatRatio: calculation ? calculation.heatRatio : 0,
          hoursPending: calculation ? calculation.hoursPending : 0,
          coords,
        }
      })
  }, [complaints, nowMs, timeOffsetHours, formulaMode])

  // Zone statistics: open count & peak urgency score
  const zoneStats = useMemo(() => {
    const stats: Record<Category, { count: number; peakScore: number }> = {
      'Wi-Fi': { count: 0, peakScore: 0 },
      'Hostel': { count: 0, peakScore: 0 },
      'Classroom': { count: 0, peakScore: 0 },
      'Laboratory': { count: 0, peakScore: 0 },
    }

    for (const item of unresolvedWithScores) {
      const cat = item.complaint.category
      stats[cat].count += 1
      if (item.score > stats[cat].peakScore) {
        stats[cat].peakScore = item.score
      }
    }

    return stats
  }, [unresolvedWithScores])

  // CRITICAL PERFORMANCE: Redraw canvas ONLY when data changes, never in animation loop!
  useEffect(() => {
    const visibleCanvas = canvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    if (!visibleCanvas || !offscreenCanvas) return

    const offCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true })
    const visCtx = visibleCanvas.getContext('2d')
    if (!offCtx || !visCtx) return

    // 1. Clear offscreen 250x150 canvas
    offCtx.clearRect(0, 0, 250, 150)

    // 2. Paint radial alpha blobs for each unresolved complaint
    for (const item of unresolvedWithScores) {
      if (item.score <= 0) continue

      const { offX, offY } = item.coords
      // Radius scales with heatRatio (between 12 and 32 pixels in offscreen space)
      const radius = 12 + item.heatRatio * 20

      const grad = offCtx.createRadialGradient(
        offX,
        offY,
        0,
        offX,
        offY,
        radius
      )
      // High heat has denser alpha core
      const coreAlpha = Math.min(1, 0.5 + item.heatRatio * 0.5)
      const midAlpha = Math.min(1, 0.25 + item.heatRatio * 0.35)
      grad.addColorStop(0, `rgba(0, 0, 0, ${coreAlpha})`)
      grad.addColorStop(0.45, `rgba(0, 0, 0, ${midAlpha})`)
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      offCtx.fillStyle = grad
      offCtx.beginPath()
      offCtx.arc(offX, offY, radius, 0, Math.PI * 2)
      offCtx.fill()
    }

    // 3. Transform alpha pixels through 256-entry lookup table
    const imgData = offCtx.getImageData(0, 0, 250, 150)
    const d = imgData.data
    const lut = getThermalLookupTable()

    for (let i = 0; i < d.length; i += 4) {
      const alpha = d[i + 3]
      if (alpha > 0) {
        const offset = alpha * 4
        d[i] = lut[offset]         // R
        d[i + 1] = lut[offset + 1] // G
        d[i + 2] = lut[offset + 2] // B
        // Blend alpha smoothly into the dark Night Lens canvas
        d[i + 3] = Math.min(235, Math.round(alpha * 1.25))
      }
    }

    offCtx.putImageData(imgData, 0, 0)

    // 4. Draw offscreen canvas scaled up onto visible canvas with bilinear smoothing
    visCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height)
    visCtx.imageSmoothingEnabled = true
    visCtx.drawImage(
      offscreenCanvas,
      0,
      0,
      visibleCanvas.width,
      visibleCanvas.height
    )
  }, [unresolvedWithScores])

  const handleHotspotClick = (complaintId: string) => {
    setSelectedComplaintId(complaintId)
    setCategoryFilter('All')
    setStatusFilter('All')
    setSearchQuery('')
    setTimeout(() => {
      const el = document.getElementById(`complaint-row-${complaintId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 60)
  }

  const handleZoneClick = (category: Category) => {
    setCategoryFilter(category)
    setStatusFilter('All')
    setSearchQuery('')
    setTimeout(() => {
      const listEl = document.getElementById('complaint-list-anchor')
      if (listEl) {
        listEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
  }

  return (
    <section
      aria-label="Campus Thermal Map"
      className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-5 md:p-6 shadow-xl space-y-4 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9E4FF]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5237A]/25 to-[#FF7A18]/25 border border-[#E5237A]/40 flex items-center justify-center text-[#FF7A18] shadow-md shadow-[#E5237A]/15">
            <Flame className="w-5 h-5 text-[#FF7A18]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#E9E4FF] font-['Anybody_Variable',sans-serif] tracking-tight">
                Campus Thermal Map
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#3FD0C9]/15 text-[#3FD0C9] border border-[#3FD0C9]/30">
                GPU 250x150
              </span>
            </div>
            <p className="text-xs text-[#A79FD6]">
              Offscreen-accelerated architectural heatmap showing real-time campus urgency load.
            </p>
          </div>
        </div>

        {/* Legend / Metrics */}
        <div className="flex items-center gap-2">
          {unresolvedWithScores.length === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3FD0C9]/15 border border-[#3FD0C9]/35 text-[#3FD0C9] text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>All Clear</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-[#A79FD6] bg-[#0D0A26] px-3 py-1.5 rounded-xl border border-[#E9E4FF]/10">
              <span className="w-2 h-2 rounded-full bg-[#E5237A] animate-pulse" />
              <span>
                <strong className="text-[#E9E4FF]">{unresolvedWithScores.length}</strong> active blobs
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container: Offscreen-Upscaled Canvas + SVG Architectural Overlay */}
      <div className="relative w-full aspect-[1000/600] rounded-xl overflow-hidden bg-[#0A071E] border border-[#E9E4FF]/10 shadow-2xl">
        {/* Layer 1: Visible Upscaled Thermal Heatmap Canvas */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85"
        />

        {/* Layer 2: SVG Architectural Layout & Interactive Markers */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full select-none"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern
              id="arch-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(233, 228, 255, 0.03)"
                strokeWidth="1"
              />
            </pattern>

            {/* Central Nexus Radial Glow */}
            <radialGradient id="nexus-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3FD0C9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3FD0C9" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Architectural Background Grid */}
          <rect width="1000" height="600" fill="url(#arch-grid)" />

          {/* Pathways / Campus Spinal Walkways */}
          {/* North-South Corridor */}
          <line
            x1="500"
            y1="40"
            x2="500"
            y2="560"
            stroke="rgba(233, 228, 255, 0.12)"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          {/* East-West Corridor */}
          <line
            x1="40"
            y1="290"
            x2="960"
            y2="290"
            stroke="rgba(233, 228, 255, 0.12)"
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Central Campus Hub / Plaza */}
          <circle cx="500" cy="290" r="32" fill="url(#nexus-glow)" />
          <circle
            cx="500"
            cy="290"
            r="18"
            fill="#0D0A26"
            stroke="rgba(233, 228, 255, 0.25)"
            strokeWidth="2"
          />
          <text
            x="500"
            y="294"
            textAnchor="middle"
            fill="#A79FD6"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            PLAZA
          </text>

          {/* 4 Campus Zones */}
          {(Object.keys(ZONE_BOUNDS) as Category[]).map((cat) => {
            const zone = ZONE_BOUNDS[cat]
            const stats = zoneStats[cat]
            const width = zone.maxX - zone.minX
            const height = zone.maxY - zone.minY

            return (
              <g
                key={cat}
                onClick={() => handleZoneClick(cat)}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleZoneClick(cat)
                }}
              >
                {/* Zone Outline Box */}
                <rect
                  x={zone.minX}
                  y={zone.minY}
                  width={width}
                  height={height}
                  rx="14"
                  fill="rgba(24, 19, 66, 0.45)"
                  stroke="rgba(233, 228, 255, 0.14)"
                  strokeWidth="1.5"
                  className="transition-colors duration-200 group-hover:stroke-[#3FD0C9]/60 group-hover:fill-[rgba(24,19,66,0.65)]"
                />

                {/* Zone Header Bar */}
                <rect
                  x={zone.minX}
                  y={zone.minY}
                  width={width}
                  height="36"
                  rx="14"
                  fill="rgba(13, 10, 38, 0.6)"
                />
                <rect
                  x={zone.minX}
                  y={zone.minY + 28}
                  width={width}
                  height="8"
                  fill="rgba(13, 10, 38, 0.6)"
                />

                {/* Zone Title & Details */}
                <text
                  x={zone.minX + 16}
                  y={zone.minY + 23}
                  fill="#E9E4FF"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {zone.title}
                </text>

                {/* Zone Metrics Pill (Open count & peak score) */}
                <g transform={`translate(${zone.maxX - 110}, ${zone.minY + 8})`}>
                  <rect
                    width="96"
                    height="20"
                    rx="10"
                    fill={stats.count > 0 ? 'rgba(255, 122, 24, 0.2)' : 'rgba(63, 208, 201, 0.15)'}
                    stroke={stats.count > 0 ? 'rgba(255, 122, 24, 0.4)' : 'rgba(63, 208, 201, 0.3)'}
                    strokeWidth="1"
                  />
                  <text
                    x="48"
                    y="14"
                    textAnchor="middle"
                    fill={stats.count > 0 ? '#FFD23F' : '#3FD0C9'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {stats.count} Open · Pk {stats.peakScore}
                  </text>
                </g>

                {/* Zone Subtitle */}
                <text
                  x={zone.minX + 16}
                  y={zone.maxY - 14}
                  fill="#A79FD6"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                  opacity="0.75"
                >
                  {zone.subtitle} · Click to filter
                </text>
              </g>
            )
          })}

          {/* Hotspot Markers for each unresolved complaint */}
          {unresolvedWithScores.map((item) => {
            const { complaint: c, score, coords, hoursPending } = item
            const scoreColor = interpolateThermalColor(score)
            const isSelected = selectedComplaintId === c.id

            return (
              <g
                key={c.id}
                transform={`translate(${coords.svgX}, ${coords.svgY})`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleHotspotClick(c.id)
                }}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label={`${c.id}, ${c.category}, score ${score}, ${c.status}, ${Math.round(hoursPending)} hours`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    handleHotspotClick(c.id)
                  }
                }}
              >
                {/* Animation: Soft pulse for Raised, steady rotating dashed ring for In Progress */}
                {c.status === 'Raised' ? (
                  <circle
                    r="22"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping origin-center"
                    style={{ animationDuration: '2.5s' }}
                  />
                ) : (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#FFD23F"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-spin origin-center"
                    style={{ animationDuration: '6s' }}
                  />
                )}

                {/* Selection ring if currently selected */}
                {isSelected && (
                  <circle
                    r="26"
                    fill="none"
                    stroke="#FFD23F"
                    strokeWidth="2.5"
                    strokeDasharray="2 2"
                    className="animate-spin origin-center"
                  />
                )}

                {/* Core Hotspot Circle */}
                <circle
                  r="14"
                  fill="#0D0A26"
                  stroke={scoreColor}
                  strokeWidth="2.5"
                  className="transition-transform duration-200 group-hover:scale-125"
                  style={{
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                  }}
                />

                {/* Hotspot Label (Complaint ID & Score) */}
                <text
                  y="4"
                  textAnchor="middle"
                  fill="#FFF4D6"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="'Anybody Variable', monospace"
                  className="pointer-events-none select-none"
                >
                  {c.id}
                </text>

                {/* Score badge hovering above */}
                <g transform="translate(14, -14)">
                  <circle
                    r="8"
                    fill={scoreColor}
                    stroke="#0D0A26"
                    strokeWidth="1.5"
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#0D0A26"
                    fontSize="9"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    {score}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Zero Unresolved Overlay */}
        {unresolvedWithScores.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0D0A26]/80 backdrop-blur-sm pointer-events-none">
            <div className="bg-[#181342] border border-[#3FD0C9]/40 rounded-2xl p-6 text-center space-y-2 shadow-2xl">
              <CheckCircle2 className="w-10 h-10 text-[#3FD0C9] mx-auto" />
              <h3 className="text-base font-bold text-[#3FD0C9] font-['Anybody_Variable',sans-serif]">
                All Clear · Zero Active Thermal Blobs
              </h3>
              <p className="text-xs text-[#A79FD6] max-w-sm">
                Every reported issue has been marked resolved. The campus temperature is completely balanced.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thermal Heat Scale Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-[#A79FD6] border-t border-[#E9E4FF]/10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#A79FD6] font-bold">
            Thermal Heat Ramp:
          </span>
          <div className="h-3 w-40 sm:w-56 rounded-full overflow-hidden bg-[#0D0A26] border border-[#E9E4FF]/20 relative">
            <div
              className="h-full w-full"
              style={{
                background:
                  'linear-gradient(to right, #2A1B8C 0%, #7A2BC9 20%, #E5237A 40%, #FF7A18 60%, #FFD23F 80%, #FFF4D6 100%)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2A1B8C] border border-[#E9E4FF]/30" />
            0 Cold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E5237A]" />
            4 Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFF4D6]" />
            10 White-Hot
          </span>
        </div>
      </div>
    </section>
  )
}
