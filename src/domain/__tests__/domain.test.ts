import { describe, expect, it } from 'vitest'
import {
  CATEGORY_WEIGHTS,
  CRITICAL_KEYWORDS_REGEX,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
} from '../config'
import {
  getHoursPending,
  getTopPriorityQueue,
  scoreComplaint,
} from '../scoring'
import type { Complaint } from '../types'
import {
  advanceComplaintStatus,
  computeSummaryCounts,
  generateNextId,
  getNextAllowedStatus,
  isValidComplaintRecord,
  validateComplaintInput,
} from '../workflow'

const NOW = 1700000000000 // Fixed base epoch

function createSeedComplaints(now = NOW): Complaint[] {
  return [
    {
      id: 'C01',
      category: 'Wi-Fi',
      description:
        'Wi-Fi keeps dropping every few minutes in the library reading hall and main academic block.',
      status: 'Raised',
      submittedAt: now - 48 * 3600000,
      updatedAt: now - 48 * 3600000,
      history: [{ from: null, to: 'Raised', changedAt: now - 48 * 3600000 }],
    },
    {
      id: 'C02',
      category: 'Hostel',
      description:
        'Hot water geyser and drinking water cooler not working on the second floor of Hostel Block B.',
      status: 'In Progress',
      submittedAt: now - 8 * 3600000,
      updatedAt: now - 8 * 3600000,
      history: [{ from: 'Raised', to: 'In Progress', changedAt: now - 8 * 3600000 }],
    },
    {
      id: 'C03',
      category: 'Classroom',
      description:
        'Ceiling projector HDMI matrix in Room 204 will not turn on, disrupting scheduled lectures.',
      status: 'Raised',
      submittedAt: now - 72 * 3600000,
      updatedAt: now - 72 * 3600000,
      history: [{ from: null, to: 'Raised', changedAt: now - 72 * 3600000 }],
    },
    {
      id: 'C04',
      category: 'Laboratory',
      description:
        'Oscilloscope workbench ground fault and microscope lamp failure at Station 3 in Lab 2.',
      status: 'Resolved',
      submittedAt: now - 24 * 3600000,
      updatedAt: now,
      history: [{ from: 'In Progress', to: 'Resolved', changedAt: now }],
    },
  ]
}

describe('Domain: Configuration & Category Weights', () => {
  it('has exact category weights specified by rubric', () => {
    expect(CATEGORY_WEIGHTS['Laboratory']).toBe(3)
    expect(CATEGORY_WEIGHTS['Wi-Fi']).toBe(2)
    expect(CATEGORY_WEIGHTS['Hostel']).toBe(2)
    expect(CATEGORY_WEIGHTS['Classroom']).toBe(1)
  })

  it('enforces description length bounds 10..280', () => {
    expect(DESCRIPTION_MIN).toBe(10)
    expect(DESCRIPTION_MAX).toBe(280)
  })
})

describe('Domain: Scoring Engine', () => {
  it('computes continuous hours pending accurately', () => {
    expect(getHoursPending(NOW - 10 * 3600000, NOW, 0)).toBe(10)
    expect(getHoursPending(NOW - 10 * 3600000, NOW, 5)).toBe(15)
    expect(getHoursPending(NOW + 5 * 3600000, NOW, 0)).toBe(0)
  })

  it('correctly scores official PDF seed data', () => {
    const [c01, c02, c03, c04] = createSeedComplaints()

    const s01 = scoreComplaint(c01, NOW)
    expect(s01).not.toBeNull()
    expect(s01?.hoursPending).toBe(48)
    expect(s01?.categoryWeight).toBe(2)
    expect(s01?.ageScore).toBe(2) // floor(48 / 24) = 2
    expect(s01?.score).toBe(4) // 2 + 2 = 4
    expect(s01?.arithmeticText).toBe('Score 4 = category 2 + age 2')

    const s02 = scoreComplaint(c02, NOW)
    expect(s02).not.toBeNull()
    expect(s02?.hoursPending).toBe(8)
    expect(s02?.categoryWeight).toBe(2)
    expect(s02?.ageScore).toBe(0) // floor(8 / 24) = 0
    expect(s02?.score).toBe(2) // 2 + 0 = 2
    expect(s02?.arithmeticText).toBe('Score 2 = category 2 + age 0')

    const s03 = scoreComplaint(c03, NOW)
    expect(s03).not.toBeNull()
    expect(s03?.hoursPending).toBe(72)
    expect(s03?.categoryWeight).toBe(1)
    expect(s03?.ageScore).toBe(3) // floor(72 / 24) = 3
    expect(s03?.score).toBe(4) // 1 + 3 = 4
    expect(s03?.arithmeticText).toBe('Score 4 = category 1 + age 3')

    // C04 is Resolved -> MUST return null
    const s04 = scoreComplaint(c04, NOW)
    expect(s04).toBeNull()
  })

  it('handles boundary conditions for age scoring and future timestamps', () => {
    const baseComplaint: Complaint = {
      id: 'C99',
      category: 'Laboratory', // weight 3
      description: 'Standard laboratory test issue description here.',
      status: 'Raised',
      submittedAt: NOW,
      updatedAt: NOW,
      history: [],
    }

    // 23.99 hours ago -> floor(23.99 / 24) = age 0
    const sub23_99 = NOW - 23.99 * 3600000
    const s23_99 = scoreComplaint({ ...baseComplaint, submittedAt: sub23_99 }, NOW)
    expect(s23_99?.ageScore).toBe(0)
    expect(s23_99?.score).toBe(3)

    // Exact 24 hours ago -> floor(24 / 24) = age 1
    const sub24 = NOW - 24 * 3600000
    const s24 = scoreComplaint({ ...baseComplaint, submittedAt: sub24 }, NOW)
    expect(s24?.ageScore).toBe(1)
    expect(s24?.score).toBe(4)

    // Future timestamp -> hoursPending should clamp to 0
    const subFuture = NOW + 10 * 3600000
    const sFuture = scoreComplaint({ ...baseComplaint, submittedAt: subFuture }, NOW)
    expect(sFuture?.hoursPending).toBe(0)
    expect(sFuture?.ageScore).toBe(0)
    expect(sFuture?.score).toBe(3)
  })

  it('correctly simulates fast-forward timeOffsetHours (+24h and +48h)', () => {
    const [c01, c02, c03] = createSeedComplaints()

    // Fast-Forward +24h -> scores: C01: 5, C02: 3, C03: 5
    const s01_24 = scoreComplaint(c01, NOW, 24)
    const s02_24 = scoreComplaint(c02, NOW, 24)
    const s03_24 = scoreComplaint(c03, NOW, 24)
    expect(s01_24?.score).toBe(5) // 2 + floor(72/24=3) = 5
    expect(s02_24?.score).toBe(3) // 2 + floor(32/24=1) = 3
    expect(s03_24?.score).toBe(5) // 1 + floor(96/24=4) = 5

    // Fast-Forward +48h -> scores: C01: 6, C02: 4, C03: 6
    const s01_48 = scoreComplaint(c01, NOW, 48)
    const s02_48 = scoreComplaint(c02, NOW, 48)
    const s03_48 = scoreComplaint(c03, NOW, 48)
    expect(s01_48?.score).toBe(6) // 2 + floor(96/24=4) = 6
    expect(s02_48?.score).toBe(4) // 2 + floor(56/24=2) = 4
    expect(s03_48?.score).toBe(6) // 1 + floor(120/24=5) = 6
  })
})

describe('Domain: Enhanced SLA Formula & Keyword Detection', () => {
  it('strictly detects whole words and avoids false positives', () => {
    // Matches
    expect(CRITICAL_KEYWORDS_REGEX.test('There is a fire in room 101')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Spark from breaker panel')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Water leak on server rack')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Major power outage today')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Total blackout in block C')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Upcoming exam will fail')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Device is broken and smoking')).toBe(true)
    expect(CRITICAL_KEYWORDS_REGEX.test('Dangerous short circuit detected')).toBe(true)

    // Must NOT match substrings
    expect(CRITICAL_KEYWORDS_REGEX.test('Configure the firewall settings')).toBe(false)
    expect(CRITICAL_KEYWORDS_REGEX.test('See the example code on github')).toBe(false)
    expect(CRITICAL_KEYWORDS_REGEX.test('Sparkling clean floor')).toBe(false)
    expect(CRITICAL_KEYWORDS_REGEX.test('Examination room is locked')).toBe(false)
  })

  it('calculates unattended and critical keyword bonuses in enhanced mode', () => {
    const complaint: Complaint = {
      id: 'C10',
      category: 'Laboratory', // weight 3
      description: 'Major fire detected on test bench during finals',
      status: 'Raised',
      submittedAt: NOW, // 0 hours -> age 0
      updatedAt: NOW,
      history: [],
    }

    // Baseline: 3 + 0 + 0 = 3
    const baseline = scoreComplaint(complaint, NOW, 0, 'baseline')
    expect(baseline?.score).toBe(3)
    expect(baseline?.bonusScore).toBe(0)

    // Enhanced: 3 + 0 + 1 (Raised) + 1 (fire) = 5
    const enhanced = scoreComplaint(complaint, NOW, 0, 'enhanced')
    expect(enhanced?.score).toBe(5)
    expect(enhanced?.bonusScore).toBe(2)
    expect(enhanced?.arithmeticText).toBe('Score 5 = category 3 + age 0 + bonus 2')

    // If status moves to 'In Progress', unattended bonus drops by 1
    const inProgress = scoreComplaint({ ...complaint, status: 'In Progress' }, NOW, 0, 'enhanced')
    expect(inProgress?.score).toBe(4) // 3 + 0 + 0 + 1
    expect(inProgress?.bonusScore).toBe(1)
  })
})

describe('Domain: Priority Queue & Tie-Breaking Hierarchy', () => {
  it('ranks C03, C01, C02 in default age-first mode with exact tie-break sentences', () => {
    const complaints = createSeedComplaints()
    const queue = getTopPriorityQueue(complaints, NOW, 0, 'baseline', 'age-first', 3)

    expect(queue).toHaveLength(3)

    // Order: C03 (#1), C01 (#2), C02 (#3). C04 is excluded because Resolved.
    expect(queue[0].id).toBe('C03')
    expect(queue[0].score).toBe(4)
    expect(queue[0].rank).toBe(1)
    expect(queue[0].tieBreakSentence).toBe(
      'Ranked above C01: same score (4), waiting longer (72h vs 48h).'
    )

    expect(queue[1].id).toBe('C01')
    expect(queue[1].score).toBe(4)
    expect(queue[1].rank).toBe(2)
    expect(queue[1].tieBreakSentence).toBe('Ranked above C02: higher score (4 vs 2).')

    expect(queue[2].id).toBe('C02')
    expect(queue[2].score).toBe(2)
    expect(queue[2].rank).toBe(3)
    expect(queue[2].tieBreakSentence).toBe('Lowest of the top three: score 2 = category 2 + age 0.')
  })

  it('swaps C01 and C03 in category-first mode', () => {
    const complaints = createSeedComplaints()
    const queue = getTopPriorityQueue(complaints, NOW, 0, 'baseline', 'category-first', 3)

    expect(queue).toHaveLength(3)

    // Order: C01 (#1: Wi-Fi weight 2 beats Classroom weight 1), C03 (#2), C02 (#3)
    expect(queue[0].id).toBe('C01')
    expect(queue[0].rank).toBe(1)
    expect(queue[0].tieBreakSentence).toBe(
      'Ranked above C03: same score (4), higher category weight (2 vs 1).'
    )

    expect(queue[1].id).toBe('C03')
    expect(queue[1].rank).toBe(2)
    expect(queue[1].tieBreakSentence).toBe('Ranked above C02: higher score (4 vs 2).')

    expect(queue[2].id).toBe('C02')
    expect(queue[2].rank).toBe(3)
    expect(queue[2].tieBreakSentence).toBe('Lowest of the top three: score 2 = category 2 + age 0.')
  })

  it('applies untouched status priority (Raised before In Progress) on tied score, wait, and weight', () => {
    const tiedA: Complaint = {
      id: 'C10',
      category: 'Wi-Fi',
      description: 'Identical complaint A description here.',
      status: 'Raised',
      submittedAt: NOW - 24 * 3600000,
      updatedAt: NOW - 24 * 3600000,
      history: [],
    }
    const tiedB: Complaint = {
      id: 'C11',
      category: 'Wi-Fi',
      description: 'Identical complaint B description here.',
      status: 'In Progress',
      submittedAt: NOW - 24 * 3600000,
      updatedAt: NOW - 24 * 3600000,
      history: [],
    }

    const queue = getTopPriorityQueue([tiedB, tiedA], NOW, 0, 'baseline', 'age-first', 2)
    expect(queue[0].id).toBe('C10') // Raised ranks before In Progress
    expect(queue[1].id).toBe('C11')
    expect(queue[0].tieBreakSentence).toBe(
      'Ranked above C11: same score (3), untouched status (Raised vs In Progress).'
    )
  })

  it('falls back to lexicographical numeric ID when all else is identical', () => {
    const tiedA: Complaint = {
      id: 'C05',
      category: 'Wi-Fi',
      description: 'Identical complaint 5 description here.',
      status: 'Raised',
      submittedAt: NOW - 24 * 3600000,
      updatedAt: NOW - 24 * 3600000,
      history: [],
    }
    const tiedB: Complaint = {
      id: 'C06',
      category: 'Wi-Fi',
      description: 'Identical complaint 6 description here.',
      status: 'Raised',
      submittedAt: NOW - 24 * 3600000,
      updatedAt: NOW - 24 * 3600000,
      history: [],
    }

    const queue = getTopPriorityQueue([tiedB, tiedA], NOW, 0, 'baseline', 'age-first', 2)
    expect(queue[0].id).toBe('C05') // Lower numeric ID first
    expect(queue[1].id).toBe('C06')
    expect(queue[0].tieBreakSentence).toBe(
      'Ranked above C06: same score (3), lower ID order (C05 vs C06).'
    )
  })

  it('formats single-item queue sentence correctly', () => {
    const single: Complaint = {
      id: 'C01',
      category: 'Wi-Fi',
      description: 'Only one complaint present in system.',
      status: 'Raised',
      submittedAt: NOW - 48 * 3600000,
      updatedAt: NOW - 48 * 3600000,
      history: [],
    }

    const queue = getTopPriorityQueue([single], NOW, 0, 'baseline', 'age-first', 3)
    expect(queue).toHaveLength(1)
    expect(queue[0].tieBreakSentence).toBe('Only open complaint: score 4 = category 2 + age 2.')
  })
})

describe('Domain: Workflow & State Machine', () => {
  it('strictly enforces forward-only status transitions', () => {
    expect(getNextAllowedStatus('Raised')).toBe('In Progress')
    expect(getNextAllowedStatus('In Progress')).toBe('Resolved')
    expect(getNextAllowedStatus('Resolved')).toBeNull()

    const initial: Complaint = {
      id: 'C01',
      category: 'Wi-Fi',
      description: 'Sample problem in room 101.',
      status: 'Raised',
      submittedAt: NOW,
      updatedAt: NOW,
      history: [{ from: null, to: 'Raised', changedAt: NOW }],
    }

    // Step 1: Raised -> In Progress
    const step1 = advanceComplaintStatus(initial, NOW + 1000)
    expect(step1.status).toBe('In Progress')
    expect(step1.updatedAt).toBe(NOW + 1000)
    expect(step1.history).toHaveLength(2)
    expect(step1.history[1]).toEqual({
      from: 'Raised',
      to: 'In Progress',
      changedAt: NOW + 1000,
    })

    // Step 2: In Progress -> Resolved
    const step2 = advanceComplaintStatus(step1, NOW + 2000)
    expect(step2.status).toBe('Resolved')
    expect(step2.updatedAt).toBe(NOW + 2000)
    expect(step2.history).toHaveLength(3)

    // Attempting to advance a Resolved complaint MUST throw
    expect(() => advanceComplaintStatus(step2, NOW + 3000)).toThrow(
      "Invalid status transition: cannot advance from 'Resolved'."
    )
  })

  it('generates collision-safe incremented IDs with 2-digit padding', () => {
    expect(generateNextId([])).toBe('C01')

    const seed = createSeedComplaints()
    expect(generateNextId(seed)).toBe('C05') // Highest is C04 -> C05

    const complaintsWithC99: Complaint[] = [
      ...seed,
      {
        id: 'C99',
        category: 'Classroom',
        description: 'Issue near boundary.',
        status: 'Raised',
        submittedAt: NOW,
        updatedAt: NOW,
        history: [],
      },
    ]
    expect(generateNextId(complaintsWithC99)).toBe('C100') // Past 99 expands to C100
  })

  it('validates complaint form input with exact specifications', () => {
    // Missing category
    const resNoCategory = validateComplaintInput('', 'Valid description text.')
    expect(resNoCategory.isValid).toBe(false)
    expect(resNoCategory.errors.category).toBe('Choose a category.')

    // Description < 10 chars (e.g. 9 chars)
    const res9Chars = validateComplaintInput('Wi-Fi', '123456789')
    expect(res9Chars.isValid).toBe(false)
    expect(res9Chars.errors.description).toBe('Describe the problem in at least 10 characters.')

    // Whitespace only
    const resWhitespace = validateComplaintInput('Wi-Fi', '          ')
    expect(resWhitespace.isValid).toBe(false)
    expect(resWhitespace.errors.description).toBe('Describe the problem in at least 10 characters.')

    // Exact 10 chars
    const res10Chars = validateComplaintInput('Wi-Fi', '1234567890')
    expect(res10Chars.isValid).toBe(true)

    // Exact 280 chars
    const res280Chars = validateComplaintInput('Wi-Fi', 'a'.repeat(280))
    expect(res280Chars.isValid).toBe(true)

    // 281 chars
    const res281Chars = validateComplaintInput('Wi-Fi', 'a'.repeat(281))
    expect(res281Chars.isValid).toBe(false)
    expect(res281Chars.errors.description).toBe('Keep it under 280 characters.')

    // Negative initialHoursAgo
    const resNegHours = validateComplaintInput('Wi-Fi', 'Valid problem description.', -5)
    expect(resNegHours.isValid).toBe(false)
    expect(resNegHours.errors.initialHoursAgo).toBe('Initial hours cannot be negative.')
  })

  it('deeply validates stored record shape using isValidComplaintRecord', () => {
    const [c01] = createSeedComplaints()
    expect(isValidComplaintRecord(c01)).toBe(true)

    // Not an object or null
    expect(isValidComplaintRecord(null)).toBe(false)
    expect(isValidComplaintRecord('string')).toBe(false)
    expect(isValidComplaintRecord(123)).toBe(false)

    // Malformed ID
    expect(isValidComplaintRecord({ ...c01, id: 'invalid-id' })).toBe(false)
    expect(isValidComplaintRecord({ ...c01, id: '' })).toBe(false)

    // Unknown category
    expect(isValidComplaintRecord({ ...c01, category: 'Cafeteria' })).toBe(false)

    // Unknown status
    expect(isValidComplaintRecord({ ...c01, status: 'Pending' })).toBe(false)

    // Bad description length
    expect(isValidComplaintRecord({ ...c01, description: 'Short' })).toBe(false)

    // Non-finite or negative timestamps
    expect(isValidComplaintRecord({ ...c01, submittedAt: NaN })).toBe(false)
    expect(isValidComplaintRecord({ ...c01, submittedAt: -100 })).toBe(false)
    expect(isValidComplaintRecord({ ...c01, updatedAt: c01.submittedAt - 1000 })).toBe(false)

    // Missing or invalid history
    expect(isValidComplaintRecord({ ...c01, history: null })).toBe(false)
    expect(isValidComplaintRecord({ ...c01, history: ['bad entry'] })).toBe(false)
  })

  it('computes telemetry summary counts with invariant checks', () => {
    const seed = createSeedComplaints()
    const counts = computeSummaryCounts(seed)

    expect(counts.total).toBe(4)
    expect(counts.pending).toBe(3) // C01 (Raised) + C02 (In Progress) + C03 (Raised)
    expect(counts.raised).toBe(2)
    expect(counts.inProgress).toBe(1)
    expect(counts.resolved).toBe(1) // C04

    // Invariants
    expect(counts.total).toBe(counts.pending + counts.resolved)
    expect(counts.pending).toBe(counts.raised + counts.inProgress)
  })
})
