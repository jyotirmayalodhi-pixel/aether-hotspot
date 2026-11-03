import { describe, it, expect } from 'vitest'
import {
  getThermalLookupTable,
  interpolateThermalColor,
  getThermalFontVariation,
} from '../thermal'

describe('Thermal heat ramp and lookup table', () => {
  it('precomputes a 256-entry RGBA lookup table of exact length 1024', () => {
    const lut = getThermalLookupTable()
    expect(lut).toBeInstanceOf(Uint8ClampedArray)
    expect(lut.length).toBe(256 * 4)

    // Stop 0: Cold Indigo (#2A1B8C -> 42, 27, 140)
    expect(lut[0]).toBe(42)
    expect(lut[1]).toBe(27)
    expect(lut[2]).toBe(140)
    expect(lut[3]).toBe(255)

    // Stop 255: White-Hot (#FFF4D6 -> 255, 244, 214)
    const lastOffset = 255 * 4
    expect(lut[lastOffset]).toBe(255)
    expect(lut[lastOffset + 1]).toBe(244)
    expect(lut[lastOffset + 2]).toBe(214)
    expect(lut[lastOffset + 3]).toBe(255)
  })

  it('interpolates colors monotonically along the 6-stop thermal ramp', () => {
    const cold = interpolateThermalColor(0)
    const hot = interpolateThermalColor(10)
    expect(cold).toBe('rgb(42, 27, 140)')
    expect(hot).toBe('rgb(255, 244, 214)')
  })

  it('scales font variations smoothly between score 0 and score 10', () => {
    const v0 = getThermalFontVariation(0)
    expect(v0.wght).toBe(500)
    expect(v0.wdth).toBe(85)
    expect(v0.style.fontVariationSettings).toBe("'wght' 500, 'wdth' 85")

    const v10 = getThermalFontVariation(10)
    expect(v10.wght).toBe(900)
    expect(v10.wdth).toBe(125)
    expect(v10.style.fontVariationSettings).toBe("'wght' 900, 'wdth' 125")
  })
})
