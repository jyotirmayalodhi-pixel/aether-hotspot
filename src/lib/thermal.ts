/**
 * 6-Stop Thermal Heat Ramp Colors and Interpolation Utility
 */
export const THERMAL_RAMP_STOPS = [
  { stop: 0, hex: '#2A1B8C', name: 'Cold Indigo', role: 'Score 0' },
  { stop: 1, hex: '#7A2BC9', name: 'Deep Violet', role: 'Score 2' },
  { stop: 2, hex: '#E5237A', name: 'Thermal Magenta', role: 'Score 4' },
  { stop: 3, hex: '#FF7A18', name: 'Hot Amber', role: 'Score 6' },
  { stop: 4, hex: '#FFD23F', name: 'Solar Gold', role: 'Score 8' },
  { stop: 5, hex: '#FFF4D6', name: 'White-Hot', role: 'Score 10+' },
]

export function interpolateThermalColor(score: number): string {
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

export function getThermalFontVariation(score: number) {
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
