import { useState } from "react"
import { motion } from "motion/react"
import {
  Wifi,
  Building,
  GraduationCap,
  FlaskConical,
  Flame,
  ShieldCheck,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// 6 stops for Thermal Heat Ramp
const THERMAL_RAMP_STOPS = [
  { stop: 0, hex: "#2A1B8C", name: "Cold Indigo", role: "Score 0 (Baseline / Cold)" },
  { stop: 1, hex: "#7A2BC9", name: "Deep Violet", role: "Score 2 (Low Heat)" },
  { stop: 2, hex: "#E5237A", name: "Thermal Magenta", role: "Score 4 (Medium Heat)" },
  { stop: 3, hex: "#FF7A18", name: "Hot Amber", role: "Score 6 (Elevated Heat)" },
  { stop: 4, hex: "#FFD23F", name: "Solar Gold", role: "Score 8 (High Urgency)" },
  { stop: 5, hex: "#FFF4D6", name: "White-Hot", role: "Score 10+ (Maximum Urgency)" },
]

// Named Night Lens tokens
const NAMED_COLOR_TOKENS = [
  {
    name: "Night Lens",
    hex: "#0D0A26",
    role: "Deep infrared-camera background canvas",
    badge: "Canvas BG",
  },
  {
    name: "Cold Glass",
    hex: "#181342",
    role: "Card & table row surface with 1px border",
    badge: "Surface Card",
  },
  {
    name: "Frost",
    hex: "#E9E4FF",
    role: "Primary text & crisp headings (WCAG AAA)",
    badge: "Text / AAA",
  },
  {
    name: "Mist",
    hex: "#A79FD6",
    role: "Secondary labels, timestamps & metadata",
    badge: "Meta Label",
  },
  {
    name: "Cool Mint",
    hex: "#3FD0C9",
    role: "Resolved badge, zero-incident calm & cooling ripple",
    badge: "Resolved / Calm",
  },
  {
    name: "Thermal Heat Ramp",
    hex: "#E5237A",
    gradient: "linear-gradient(90deg, #2A1B8C, #7A2BC9, #E5237A, #FF7A18, #FFD23F, #FFF4D6)",
    role: "Continuous 6-stop thermal gradient (Score 0 to 10+)",
    badge: "Urgency Ramp",
  },
]

// Interpolate color across the 6-stop Thermal Ramp
function interpolateThermalColor(score: number): string {
  const stops = [
    [42, 27, 140],   // #2A1B8C
    [122, 43, 201],  // #7A2BC9
    [229, 35, 122],  // #E5237A
    [255, 122, 24],  // #FF7A18
    [255, 210, 63],  // #FFD23F
    [255, 244, 214], // #FFF4D6
  ]
  const clamped = Math.max(0, Math.min(10, score))
  const position = (clamped / 10) * (stops.length - 1)
  const index = Math.min(stops.length - 2, Math.floor(position))
  const fraction = position - index

  const r = Math.round(stops[index][0] + fraction * (stops[index + 1][0] - stops[index][0]))
  const g = Math.round(stops[index][1] + fraction * (stops[index + 1][1] - stops[index][1]))
  const b = Math.round(stops[index][2] + fraction * (stops[index + 1][2] - stops[index][2]))

  return `rgb(${r}, ${g}, ${b})`
}

export default function App() {
  const [sliderScore, setSliderScore] = useState<number>(4)
  const [activeCategory, setActiveCategory] = useState<string>("Wi-Fi")
  const [demoStatus, setDemoStatus] = useState<"Raised" | "In Progress" | "Resolved">("Raised")

  // Linear fontVariationSettings calculation
  const getFontVariation = (score: number) => {
    const t = Math.max(0, Math.min(10, score)) / 10
    const wght = Math.round(500 + t * 400) // 500 to 900
    const wdth = Math.round(85 + t * 40)   // 85 to 125
    return {
      wght,
      wdth,
      style: {
        fontFamily: "'Anybody Variable', sans-serif",
        fontVariationSettings: `'wght' ${wght}, 'wdth' ${wdth}`,
      },
    }
  }

  const sliderVariation = getFontVariation(sliderScore)
  const sliderColor = interpolateThermalColor(sliderScore)

  return (
    <div className="min-h-screen bg-[#0D0A26] text-[#E9E4FF] font-['Instrument_Sans_Variable',sans-serif] selection:bg-[#3FD0C9]/30 selection:text-[#E9E4FF] px-6 py-10 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Header / Spec Bar */}
        <header className="border-b border-[#E9E4FF]/12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#181342] border border-[#E9E4FF]/15 text-[#3FD0C9]">
              <Flame className="w-3.5 h-3.5 animate-pulse text-[#FF7A18]" />
              <span>AETHER-HOTSPOT V3 · BLOCK B0 VERIFICATION</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-['Anybody_Variable',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-[#E9E4FF] via-[#3FD0C9] to-[#FFD23F]">
              Thermal Style Tile
            </h1>
            <p className="text-[#A79FD6] text-base max-w-2xl">
              Verification of Night Lens color tokens, variable-width Anybody font rendering (<span className="text-[#3FD0C9]">wdth 85 → 125</span>, <span className="text-[#FFD23F]">wght 500 → 900</span>), and forward-only design system primitives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#181342] border border-[#E9E4FF]/12 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs text-[#A79FD6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3FD0C9] animate-ping" />
              <span>Offscreen Thermal Engine: <strong className="text-[#E9E4FF]">250×150 Ready</strong></span>
            </div>
          </div>
        </header>

        {/* SECTION 1: Color Tokens ("Night Lens" Palette) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#3FD0C9]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
              1. "Night Lens" Color Tokens & 6-Stop Thermal Heat Ramp
            </h2>
          </div>

          {/* Named Tokens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {NAMED_COLOR_TOKENS.map((token) => (
              <div
                key={token.name}
                className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-4 flex flex-col justify-between hover:border-[#E9E4FF]/25 transition-all shadow-lg shadow-black/40"
              >
                <div
                  className="w-full h-24 rounded-xl border border-white/10 mb-3 flex items-end p-2.5 relative overflow-hidden group"
                  style={{
                    backgroundColor: token.gradient ? undefined : token.hex,
                    background: token.gradient,
                  }}
                >
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow"
                    style={{
                      backgroundColor: "rgba(13, 10, 38, 0.75)",
                      color: "#E9E4FF",
                    }}
                  >
                    {token.badge}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#E9E4FF]">{token.name}</span>
                    <code className="text-xs font-mono text-[#3FD0C9]">{token.hex}</code>
                  </div>
                  <p className="text-[11px] text-[#A79FD6] leading-snug">{token.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 6 Stops of the Thermal Ramp explicitly labeled */}
          <div className="bg-[#181342]/70 rounded-2xl border border-[#E9E4FF]/12 p-5 space-y-3">
            <div className="flex justify-between items-center text-xs font-medium text-[#A79FD6]">
              <span className="flex items-center gap-1.5 font-semibold text-[#E9E4FF]">
                <Flame className="w-3.5 h-3.5 text-[#E5237A]" /> 6 Discrete Thermal Heat Ramp Calibration Stops:
              </span>
              <span>Linear Alpha Lookup Table Source</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {THERMAL_RAMP_STOPS.map((s) => (
                <div
                  key={s.stop}
                  className="rounded-xl border border-white/10 p-3 space-y-2 bg-[#0D0A26]/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-[#A79FD6]">Stop {s.stop}</span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: s.hex }}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#E9E4FF]">{s.name}</div>
                    <code className="text-[11px] font-mono text-[#3FD0C9]">{s.hex}</code>
                  </div>
                  <div className="text-[10px] text-[#A79FD6]/80">{s.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: 0 to 10 Thermal Heat Ramp & Variable Font Width Stretch */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#FFD23F]" />
              <div>
                <h2 className="text-xl font-bold tracking-wide uppercase text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
                  2. 0 to 10 Thermal Heat Ramp & Variable Font Width Stretcher
                </h2>
                <p className="text-xs text-[#A79FD6]">
                  Demonstrating width axis dynamic load (<code className="text-[#3FD0C9]">@fontsource-variable/anybody/wdth.css</code>).
                  Numerals visibly stretch wider (<span className="text-[#3FD0C9]">wdth 85 → 125</span>) and heavier (<span className="text-[#FFD23F]">wght 500 → 900</span>).
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#181342] border border-[#E9E4FF]/15 px-3 py-1.5 rounded-lg text-xs font-mono text-[#E9E4FF]">
              <span>Axis:</span>
              <span className="text-[#3FD0C9]">wdth 85..125</span>
              <span>·</span>
              <span className="text-[#FFD23F]">wght 500..900</span>
            </div>
          </div>

          {/* The Full 0 to 10 Ramp Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
            {Array.from({ length: 11 }, (_, score) => {
              const { wght, wdth, style } = getFontVariation(score)
              const color = interpolateThermalColor(score)
              const isSelected = sliderScore === score

              return (
                <button
                  key={score}
                  onClick={() => setSliderScore(score)}
                  className={`bg-[#181342] rounded-2xl border transition-all p-3 text-center flex flex-col items-center justify-between gap-2 relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? "border-[#3FD0C9] ring-2 ring-[#3FD0C9]/40 bg-[#1F1A52]"
                      : "border-[#E9E4FF]/12 hover:border-[#E9E4FF]/30 hover:bg-[#181342]/90"
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: color }}
                  />

                  <div className="text-[10px] uppercase font-mono text-[#A79FD6] pt-1">
                    Score {score}
                  </div>

                  {/* VISIBLE VARIABLE FONT NUMERAL WITH EXPANDING WIDTH & WEIGHT */}
                  <div
                    className="text-5xl md:text-6xl my-1 select-none transition-transform group-hover:scale-105"
                    style={{
                      ...style,
                      color: color,
                      textShadow: `0 0 20px ${color}40`,
                    }}
                  >
                    {score}
                  </div>

                  {/* Axis Readout */}
                  <div className="w-full pt-1 border-t border-[#E9E4FF]/10 text-[10px] font-mono text-[#A79FD6] space-y-0.5">
                    <div className="flex justify-between">
                      <span>W:</span>
                      <span className="text-[#E9E4FF] font-semibold">{wght}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>D:</span>
                      <span className="text-[#3FD0C9] font-semibold">{wdth}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Interactive Width-Expansion Inspector Card */}
          <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/15 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-4 max-w-xl w-full">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3FD0C9]/20 text-[#3FD0C9] border border-[#3FD0C9]/30">
                  Interactive Stretcher
                </span>
                <span className="text-xs text-[#A79FD6]">
                  Inspect physical width expansion in real-time
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A79FD6]">Simulated Urgency Score:</span>
                  <span className="font-bold text-lg font-mono" style={{ color: sliderColor }}>
                    Score {sliderScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={sliderScore}
                  onChange={(e) => setSliderScore(Number(e.target.value))}
                  className="w-full accent-[#3FD0C9] cursor-pointer h-2 bg-[#0D0A26] rounded-lg border border-[#E9E4FF]/20"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#A79FD6]">
                  <span>0 (Cold: wght 500, wdth 85)</span>
                  <span>5 (Mid: wght 700, wdth 105)</span>
                  <span>10 (White-Hot: wght 900, wdth 125)</span>
                </div>
              </div>

              {/* Exact CSS Inline Code Display */}
              <div className="bg-[#0D0A26] rounded-xl p-3 border border-[#E9E4FF]/10 text-xs font-mono space-y-1">
                <div className="text-[#A79FD6] text-[11px]">// Active Inline CSS Property Applied:</div>
                <div className="text-[#E9E4FF]">
                  font-family: <span className="text-[#FFD23F]">'Anybody Variable'</span>;
                </div>
                <div className="text-[#E9E4FF]">
                  font-variation-settings:{" "}
                  <span className="text-[#3FD0C9]">
                    "'wght' {sliderVariation.wght}, 'wdth' {sliderVariation.wdth}"
                  </span>
                  ;
                </div>
                <div className="text-[#E9E4FF]">
                  color: <span style={{ color: sliderColor }}>{sliderColor}</span>;
                </div>
              </div>
            </div>

            {/* Huge Numeral Demonstration */}
            <motion.div
              layout
              className="flex flex-col items-center justify-center p-6 bg-[#0D0A26]/80 rounded-2xl border border-[#E9E4FF]/15 min-w-[280px]"
            >
              <div className="text-xs uppercase font-mono text-[#A79FD6] mb-1">
                Visual Proof of Width Axis
              </div>
              <div
                className="text-8xl md:text-9xl transition-all duration-200 select-none"
                style={{
                  ...sliderVariation.style,
                  color: sliderColor,
                  textShadow: `0 0 35px ${sliderColor}50`,
                }}
              >
                {sliderScore}
              </div>
              <div className="text-xs font-mono text-[#3FD0C9] mt-2">
                wght: {sliderVariation.wght} · wdth: {sliderVariation.wdth}%
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: Interactive Components, Buttons, Badges, & Chips */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#3FD0C9]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-[#E9E4FF] font-['Anybody_Variable',sans-serif]">
              3. Interactive Component Primitives (Buttons, Badges, Category Chips)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary & Secondary Action Buttons */}
            <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A79FD6] font-mono">
                Action Buttons
              </h3>

              <div className="space-y-3">
                <Button className="w-full bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/85 font-semibold text-sm h-10 shadow-lg shadow-[#3FD0C9]/20 transition-all cursor-pointer">
                  <Flame className="w-4 h-4 mr-2" /> Report an issue (Primary)
                </Button>

                <Button
                  variant="secondary"
                  className="w-full bg-[#181342] text-[#E9E4FF] border border-[#E9E4FF]/15 hover:bg-[#261F63] text-sm h-10 transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4 mr-2 text-[#3FD0C9]" /> Fast-Forward Time (+24h)
                </Button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="px-3 py-2 rounded-lg bg-[#261F63] hover:bg-[#322982] text-xs font-medium text-[#E9E4FF] border border-[#E9E4FF]/15 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Play className="w-3.5 h-3.5 text-[#3FD0C9]" /> Start work
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-[#3FD0C9]/15 hover:bg-[#3FD0C9]/25 text-[#3FD0C9] border border-[#3FD0C9]/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark resolved
                  </button>
                </div>
              </div>
            </div>

            {/* Forward-Only Status Badges */}
            <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A79FD6] font-mono">
                  Forward-Only Status Badges
                </h3>
                <span className="text-[10px] font-mono text-[#3FD0C9]">Active: {demoStatus}</span>
              </div>

              <div className="space-y-3">
                {/* Raised Badge */}
                <div
                  onClick={() => setDemoStatus("Raised")}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    demoStatus === "Raised"
                      ? "bg-[#0D0A26] border-[#E5237A]/50 ring-1 ring-[#E5237A]/30"
                      : "bg-[#0D0A26]/60 border-[#E9E4FF]/10 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E5237A]" />
                      <div className="absolute w-5 h-5 rounded-full border border-[#E5237A] animate-thermal-pulse" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5237A]/20 text-[#E5237A] border border-[#E5237A]/40">
                        Raised
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A79FD6]">Untouched / Soft Pulse</span>
                </div>

                {/* In Progress Badge */}
                <div
                  onClick={() => setDemoStatus("In Progress")}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    demoStatus === "In Progress"
                      ? "bg-[#0D0A26] border-[#FFD23F]/50 ring-1 ring-[#FFD23F]/30"
                      : "bg-[#0D0A26]/60 border-[#E9E4FF]/10 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFD23F]" />
                      <div className="absolute w-5 h-5 rounded-full border border-dashed border-[#FFD23F] animate-thermal-rotate" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFD23F]/20 text-[#FFD23F] border border-[#FFD23F]/40">
                        In Progress
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A79FD6]">Active Work / Rotating Ring</span>
                </div>

                {/* Resolved Badge */}
                <div
                  onClick={() => setDemoStatus("Resolved")}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    demoStatus === "Resolved"
                      ? "bg-[#0D0A26] border-[#3FD0C9]/50 ring-1 ring-[#3FD0C9]/30"
                      : "bg-[#0D0A26]/60 border-[#E9E4FF]/10 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-5 h-5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3FD0C9]" />
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3FD0C9]/20 text-[#3FD0C9] border border-[#3FD0C9]/40">
                        Resolved
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A79FD6]">Final State / Cool Mint</span>
                </div>
              </div>
            </div>

            {/* Category Chips with Official Weights */}
            <div className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/12 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A79FD6] font-mono">
                  Category Chips
                </h3>
                <span className="text-[10px] font-mono text-[#3FD0C9]">PDF Formula Weights</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Laboratory (Weight 3) */}
                <button
                  onClick={() => setActiveCategory("Laboratory")}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                    activeCategory === "Laboratory"
                      ? "border-[#E5237A] bg-[#E5237A]/15 ring-1 ring-[#E5237A]/50"
                      : "border-[#E9E4FF]/12 bg-[#0D0A26]/80 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FlaskConical className="w-4 h-4 text-[#E5237A]" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5237A]/25 text-[#E5237A] font-bold">
                      Weight 3
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#E9E4FF]">Laboratory</span>
                </button>

                {/* Wi-Fi (Weight 2) */}
                <button
                  onClick={() => setActiveCategory("Wi-Fi")}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                    activeCategory === "Wi-Fi"
                      ? "border-[#3FD0C9] bg-[#3FD0C9]/15 ring-1 ring-[#3FD0C9]/50"
                      : "border-[#E9E4FF]/12 bg-[#0D0A26]/80 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Wifi className="w-4 h-4 text-[#3FD0C9]" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#3FD0C9]/25 text-[#3FD0C9] font-bold">
                      Weight 2
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#E9E4FF]">Wi-Fi</span>
                </button>

                {/* Hostel (Weight 2) */}
                <button
                  onClick={() => setActiveCategory("Hostel")}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                    activeCategory === "Hostel"
                      ? "border-[#FF7A18] bg-[#FF7A18]/15 ring-1 ring-[#FF7A18]/50"
                      : "border-[#E9E4FF]/12 bg-[#0D0A26]/80 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building className="w-4 h-4 text-[#FF7A18]" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF7A18]/25 text-[#FF7A18] font-bold">
                      Weight 2
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#E9E4FF]">Hostel</span>
                </button>

                {/* Classroom (Weight 1) */}
                <button
                  onClick={() => setActiveCategory("Classroom")}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                    activeCategory === "Classroom"
                      ? "border-[#FFD23F] bg-[#FFD23F]/15 ring-1 ring-[#FFD23F]/50"
                      : "border-[#E9E4FF]/12 bg-[#0D0A26]/80 hover:border-[#E9E4FF]/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <GraduationCap className="w-4 h-4 text-[#FFD23F]" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FFD23F]/25 text-[#FFD23F] font-bold">
                      Weight 1
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#E9E4FF]">Classroom</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Live Mock Complaint Card (Putting It All Together) */}
        <section className="bg-[#181342] rounded-2xl border border-[#E9E4FF]/15 p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A79FD6]">
              Priority Queue Card Preview · Top-3 Card Style
            </span>
            <span className="text-xs font-mono text-[#3FD0C9]">C03 (Classroom, 72h)</span>
          </div>

          <div className="bg-[#0D0A26]/90 rounded-xl border border-[#E9E4FF]/12 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Dynamic Score Badge */}
              <div
                className="w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 shadow-lg"
                style={{
                  backgroundColor: "#181342",
                  borderColor: interpolateThermalColor(4),
                }}
              >
                <span
                  className="text-4xl select-none"
                  style={{
                    fontFamily: "'Anybody Variable', sans-serif",
                    fontVariationSettings: "'wght' 660, 'wdth' 101",
                    color: interpolateThermalColor(4),
                  }}
                >
                  4
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-[#E9E4FF]">C03</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFD23F]/15 text-[#FFD23F] border border-[#FFD23F]/30">
                    Classroom (W: 1)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E5237A]/15 text-[#E5237A] border border-[#E5237A]/30">
                    Raised
                  </span>
                  <span className="text-xs text-[#A79FD6] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 72h pending
                  </span>
                </div>
                <p className="text-sm text-[#E9E4FF] max-w-xl">
                  Ceiling projector HDMI matrix in Room 204 will not turn on, disrupting scheduled lectures.
                </p>
                <div className="text-xs font-mono text-[#3FD0C9] pt-1">
                  Arithmetic: <strong className="text-[#E9E4FF]">Score 4 = category 1 + age 3</strong>
                </div>
                <div className="text-xs text-[#A79FD6] italic">
                  Ranked above C01: same score (4), waiting longer (72h vs 48h).
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button className="bg-[#3FD0C9] text-[#0D0A26] hover:bg-[#3FD0C9]/80 font-bold text-xs h-9 px-4 cursor-pointer">
                <Play className="w-3.5 h-3.5 mr-1" /> Start work
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-[#E9E4FF]/10 text-center text-xs text-[#A79FD6]">
          AETHER-HOTSPOT · Campus Complaint Management System · Block B0 Verified
        </footer>
      </div>
    </div>
  )
}
