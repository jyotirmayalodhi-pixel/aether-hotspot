import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  getSeedComplaints,
  useComplaintStore,
} from '../useComplaintStore'
import type { Complaint } from '@/domain'

describe('Zustand Store: Shape Validation & Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    useComplaintStore.setState({
      complaints: getSeedComplaints(),
      timeOffsetHours: 0,
      searchQuery: '',
      categoryFilter: 'All',
      statusFilter: 'All',
      sortBy: 'priority',
      formulaMode: 'baseline',
      tieBreakOrder: 'age-first',
      selectedComplaintId: null,
      storageRecoveredNotice: false,
    })
  })

  it('1. First-run seeding: populates 4 PDF seed complaints with no recovery banner', () => {
    const state = useComplaintStore.getState()
    expect(state.complaints).toHaveLength(4)
    expect(state.complaints.map((c) => c.id)).toEqual(['C01', 'C02', 'C03', 'C04'])
    expect(state.storageRecoveredNotice).toBe(false)

    // Specific seed checks
    const c01 = state.complaints.find((c) => c.id === 'C01')
    expect(c01?.category).toBe('Wi-Fi')
    expect(c01?.status).toBe('Raised')

    const c04 = state.complaints.find((c) => c.id === 'C04')
    expect(c04?.category).toBe('Laboratory')
    expect(c04?.status).toBe('Resolved')
  })

  it('2. Persistence across reload: partialize only saves complaints, transient state excluded', async () => {
    // Add a new complaint C05
    const added = useComplaintStore.getState().addComplaint({
      category: 'Laboratory',
      description: 'Oscilloscope calibration certificate expired on Bench 4.',
      initialHoursAgo: 2,
    })
    expect(added.id).toBe('C05')
    expect(useComplaintStore.getState().complaints).toHaveLength(5)

    // Set transient states
    useComplaintStore.getState().setTimeOffsetHours(48)
    useComplaintStore.getState().setSearchQuery('projector')
    useComplaintStore.getState().setFormulaMode('enhanced')
    useComplaintStore.getState().setTieBreakOrder('category-first')

    // Inspect localStorage raw contents
    const rawStorage = localStorage.getItem(STORAGE_KEY)
    expect(rawStorage).not.toBeNull()
    const parsed = JSON.parse(rawStorage!)

    // MUST persist complaints
    expect(parsed.state.complaints).toHaveLength(5)
    expect(parsed.state.complaints.some((c: Complaint) => c.id === 'C05')).toBe(true)

    // MUST NOT persist transient state
    expect(parsed.state.timeOffsetHours).toBeUndefined()
    expect(parsed.state.searchQuery).toBeUndefined()
    expect(parsed.state.formulaMode).toBeUndefined()
    expect(parsed.state.tieBreakOrder).toBeUndefined()
    expect(parsed.state.storageRecoveredNotice).toBeUndefined()

    // Reset transient fields as would happen on a fresh page reload
    useComplaintStore.setState({
      timeOffsetHours: 0,
      searchQuery: '',
      formulaMode: 'baseline',
      tieBreakOrder: 'age-first',
    })

    // Rehydrate from localStorage
    await useComplaintStore.persist.rehydrate()

    const rehydrated = useComplaintStore.getState()
    expect(rehydrated.complaints).toHaveLength(5)
    expect(rehydrated.complaints.some((c) => c.id === 'C05')).toBe(true)
    // Transient values remain at initial defaults
    expect(rehydrated.timeOffsetHours).toBe(0)
    expect(rehydrated.searchQuery).toBe('')
    expect(rehydrated.formulaMode).toBe('baseline')
  })

  it('3. Broken JSON recovery: catches invalid JSON, falls back to seed data and warns', async () => {
    // Inject corrupt JSON string directly into localStorage
    localStorage.setItem(STORAGE_KEY, '{ this is corrupted { broken json syntax -- !!!')

    // Trigger rehydration
    await useComplaintStore.persist.rehydrate()

    const state = useComplaintStore.getState()
    // Does not crash, seeds default 4 complaints
    expect(state.complaints).toHaveLength(4)
    expect(state.complaints.map((c) => c.id)).toEqual(['C01', 'C02', 'C03', 'C04'])
    // Sets storageRecoveredNotice to true so UI can show dismissible notice
    expect(state.storageRecoveredNotice).toBe(true)
  })

  it('4. Shape corruption recovery: filters invalid records or recovers seed data', async () => {
    // Case A: Storage has an object with non-array complaints
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { complaints: 'not an array' },
        version: STORAGE_VERSION,
      })
    )

    await useComplaintStore.persist.rehydrate()
    expect(useComplaintStore.getState().complaints).toHaveLength(4)
    expect(useComplaintStore.getState().storageRecoveredNotice).toBe(true)

    // Case B: Storage has 1 valid record and 1 malformed record (e.g. wrong category and missing history)
    const validSeed = getSeedComplaints()[0]
    const malformedRecord = {
      id: 'C99',
      category: 'InvalidNonExistentCategory',
      description: 'Too short',
      status: 'UnknownStatus',
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { complaints: [validSeed, malformedRecord] },
        version: STORAGE_VERSION,
      })
    )

    await useComplaintStore.persist.rehydrate()
    const stateB = useComplaintStore.getState()
    // Kept the 1 valid record and discarded the malformed one
    expect(stateB.complaints).toHaveLength(1)
    expect(stateB.complaints[0].id).toBe('C01')
    expect(stateB.storageRecoveredNotice).toBe(true)
  })

  it('5. Status advancement: strictly follows Raised -> In Progress -> Resolved', () => {
    // Start with C01 (Raised)
    expect(useComplaintStore.getState().complaints.find((c) => c.id === 'C01')?.status).toBe(
      'Raised'
    )

    // Step 1: Advance to In Progress
    useComplaintStore.getState().advanceStatus('C01')
    const inProg = useComplaintStore.getState().complaints.find((c) => c.id === 'C01')
    expect(inProg?.status).toBe('In Progress')
    expect(inProg?.history.length).toBeGreaterThanOrEqual(2)

    // Step 2: Advance to Resolved
    useComplaintStore.getState().advanceStatus('C01')
    const resolved = useComplaintStore.getState().complaints.find((c) => c.id === 'C01')
    expect(resolved?.status).toBe('Resolved')

    // Step 3: Attempting to advance Resolved does nothing and does not crash
    useComplaintStore.getState().advanceStatus('C01')
    const stillResolved = useComplaintStore.getState().complaints.find((c) => c.id === 'C01')
    expect(stillResolved?.status).toBe('Resolved')
  })

  it('6. resetToSeedData: restores fresh C01-C04 records and clears recovery notice', () => {
    // Add extra items and change status
    useComplaintStore.getState().addComplaint({
      category: 'Wi-Fi',
      description: 'Extra temp issue for testing reset function.',
    })
    useComplaintStore.getState().advanceStatus('C01')
    useComplaintStore.setState({ storageRecoveredNotice: true, timeOffsetHours: 48 })

    expect(useComplaintStore.getState().complaints.length).toBeGreaterThan(4)

    // Reset
    useComplaintStore.getState().resetToSeedData()

    const state = useComplaintStore.getState()
    expect(state.complaints).toHaveLength(4)
    expect(state.complaints.map((c) => c.id)).toEqual(['C01', 'C02', 'C03', 'C04'])
    expect(state.complaints.find((c) => c.id === 'C01')?.status).toBe('Raised')
    expect(state.storageRecoveredNotice).toBe(false)
    expect(state.timeOffsetHours).toBe(0)
  })

  it('7. injectTieBreakDemo: injects two complaints with tied scores for live demo', () => {
    useComplaintStore.getState().injectTieBreakDemo()
    const complaints = useComplaintStore.getState().complaints

    expect(complaints.length).toBe(6) // 4 seed + 2 injected
    const injected = complaints.slice(0, 2)
    expect(injected.some((c) => c.category === 'Wi-Fi')).toBe(true)
    expect(injected.some((c) => c.category === 'Classroom')).toBe(true)
  })

  it('8. importComplaints: validates shape, resolves ID collisions by renaming, and rejects corrupt rows', () => {
    const rawData = [
      // Valid record with existing ID C01 -> Should be renamed
      {
        id: 'C01',
        category: 'Laboratory',
        description: 'Imported valid record with collision ID C01.',
        status: 'Raised',
        submittedAt: Date.now() - 10 * 3600000,
        updatedAt: Date.now() - 10 * 3600000,
        history: [{ from: null, to: 'Raised', changedAt: Date.now() - 10 * 3600000 }],
      },
      // Valid record with unique ID C20 -> Should be added without rename
      {
        id: 'C20',
        category: 'Wi-Fi',
        description: 'Imported valid record with unique ID C20.',
        status: 'Raised',
        submittedAt: Date.now() - 5 * 3600000,
        updatedAt: Date.now() - 5 * 3600000,
        history: [{ from: null, to: 'Raised', changedAt: Date.now() - 5 * 3600000 }],
      },
      // Invalid record -> Should be rejected
      {
        id: 'BAD_ID',
        category: 'InvalidCategory',
        description: 'short',
      },
    ]

    const result = useComplaintStore.getState().importComplaints(rawData)

    expect(result.added).toBe(2)
    expect(result.rejected).toBe(1)
    expect(result.renamed).toBe(1)

    const complaints = useComplaintStore.getState().complaints
    expect(complaints.some((c) => c.id === 'C20')).toBe(true)
    expect(complaints.some((c) => c.id === 'C05')).toBe(true) // Colliding C01 was renamed to C05!
  })
})
