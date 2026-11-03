import { CATEGORY_WEIGHTS, CRITICAL_KEYWORDS_REGEX, MAX_HEAT_SCORE } from './config'
import type {
  Complaint,
  FormulaMode,
  ScoredComplaint,
  TieBreakOrder,
} from './types'

/**
 * Computes hours pending from submission time up to nowMs + timeOffsetHours.
 */
export function getHoursPending(
  submittedAt: number,
  nowMs: number,
  timeOffsetHours = 0
): number {
  return Math.max(0, (nowMs - submittedAt) / 3600000 + timeOffsetHours)
}

export interface ScoreCalculationResult {
  hoursPending: number
  categoryWeight: number
  ageScore: number
  bonusScore: number
  score: number
  heatRatio: number
  arithmeticText: string
}

/**
 * Scores an individual complaint according to Baseline or Enhanced SLA rules.
 * Returns null if the complaint is Resolved (Resolved complaints have no urgency score).
 */
export function scoreComplaint(
  complaint: Complaint,
  nowMs: number,
  timeOffsetHours = 0,
  formulaMode: FormulaMode = 'baseline'
): ScoreCalculationResult | null {
  if (complaint.status === 'Resolved') {
    return null
  }

  const hoursPending = getHoursPending(complaint.submittedAt, nowMs, timeOffsetHours)
  const categoryWeight = CATEGORY_WEIGHTS[complaint.category]
  const ageScore = Math.floor(hoursPending / 24)

  let bonusScore = 0
  if (formulaMode === 'enhanced') {
    if (complaint.status === 'Raised') {
      bonusScore += 1
    }
    if (CRITICAL_KEYWORDS_REGEX.test(complaint.description)) {
      bonusScore += 1
    }
  }

  const score = categoryWeight + ageScore + bonusScore
  const heatRatio = Math.min(1, Math.max(0, score / MAX_HEAT_SCORE))

  const arithmeticText =
    bonusScore > 0
      ? `Score ${score} = category ${categoryWeight} + age ${ageScore} + bonus ${bonusScore}`
      : `Score ${score} = category ${categoryWeight} + age ${ageScore}`

  return {
    hoursPending,
    categoryWeight,
    ageScore,
    bonusScore,
    score,
    heatRatio,
    arithmeticText,
  }
}

/**
 * Returns numeric portion of an ID for deterministic sorting (e.g. 'C01' -> 1).
 */
function parseIdNumeric(id: string): number {
  const match = id.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

/**
 * Produces the prioritized Top-N queue (default 3) of unresolved complaints
 * with deterministic 5-step tie-breaking and human-readable comparative explanations.
 */
export function getTopPriorityQueue(
  complaints: Complaint[],
  nowMs: number,
  timeOffsetHours = 0,
  formulaMode: FormulaMode = 'baseline',
  tieBreakOrder: TieBreakOrder = 'age-first',
  limit = 3
): ScoredComplaint[] {
  // 1. Filter out Resolved complaints and score remaining
  const scoredItems: Array<Complaint & ScoreCalculationResult> = []

  for (const complaint of complaints) {
    if (complaint.status === 'Resolved') {
      continue
    }
    const calculation = scoreComplaint(complaint, nowMs, timeOffsetHours, formulaMode)
    if (calculation !== null) {
      scoredItems.push({
        ...complaint,
        ...calculation,
      })
    }
  }

  // 2. Deterministic 5-step tie-breaking sort
  scoredItems.sort((a, b) => {
    // Step 1: Higher urgency score
    if (b.score !== a.score) {
      return b.score - a.score
    }

    // Step 2 & 3: Tie-Breakers based on tieBreakOrder
    if (tieBreakOrder === 'age-first') {
      // Tie-Breaker #1: Longer continuous wait time
      if (b.hoursPending !== a.hoursPending) {
        return b.hoursPending - a.hoursPending
      }
      // Tie-Breaker #2: Higher category weight
      if (b.categoryWeight !== a.categoryWeight) {
        return b.categoryWeight - a.categoryWeight
      }
    } else {
      // Tie-Breaker #1: Higher category weight
      if (b.categoryWeight !== a.categoryWeight) {
        return b.categoryWeight - a.categoryWeight
      }
      // Tie-Breaker #2: Longer continuous wait time
      if (b.hoursPending !== a.hoursPending) {
        return b.hoursPending - a.hoursPending
      }
    }

    // Step 4 (Tie-Breaker #3): Untouched status priority (Raised ranks before In Progress)
    if (a.status !== b.status) {
      if (a.status === 'Raised' && b.status === 'In Progress') return -1
      if (a.status === 'In Progress' && b.status === 'Raised') return 1
    }

    // Step 5 (Tie-Breaker #4): Lexicographical numeric ID order (lower numeric ID first)
    return parseIdNumeric(a.id) - parseIdNumeric(b.id)
  })

  // 3. Slice to limit
  const topQueue = scoredItems.slice(0, limit)

  // 4. Generate tieBreakSentence for each item
  return topQueue.map((item, index) => {
    let tieBreakSentence = ''

    if (index < topQueue.length - 1) {
      const next = topQueue[index + 1]

      if (item.score > next.score) {
        tieBreakSentence = `Ranked above ${next.id}: higher score (${item.score} vs ${next.score}).`
      } else {
        // Equal scores
        if (tieBreakOrder === 'age-first') {
          if (item.hoursPending !== next.hoursPending) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), waiting longer (${Math.round(item.hoursPending)}h vs ${Math.round(next.hoursPending)}h).`
          } else if (item.categoryWeight !== next.categoryWeight) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), higher category weight (${item.categoryWeight} vs ${next.categoryWeight}).`
          } else if (item.status !== next.status) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), untouched status (${item.status} vs ${next.status}).`
          } else {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), lower ID order (${item.id} vs ${next.id}).`
          }
        } else {
          // Category-first
          if (item.categoryWeight !== next.categoryWeight) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), higher category weight (${item.categoryWeight} vs ${next.categoryWeight}).`
          } else if (item.hoursPending !== next.hoursPending) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), waiting longer (${Math.round(item.hoursPending)}h vs ${Math.round(next.hoursPending)}h).`
          } else if (item.status !== next.status) {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), untouched status (${item.status} vs ${next.status}).`
          } else {
            tieBreakSentence = `Ranked above ${next.id}: same score (${item.score}), lower ID order (${item.id} vs ${next.id}).`
          }
        }
      }
    } else {
      // Last item in the queue
      const arithmeticPart =
        item.bonusScore > 0
          ? `category ${item.categoryWeight} + age ${item.ageScore} + bonus ${item.bonusScore}`
          : `category ${item.categoryWeight} + age ${item.ageScore}`

      if (topQueue.length === 1) {
        tieBreakSentence = `Only open complaint: score ${item.score} = ${arithmeticPart}.`
      } else if (topQueue.length >= 3) {
        tieBreakSentence = `Lowest of the top three: score ${item.score} = ${arithmeticPart}.`
      } else {
        tieBreakSentence = `Lowest in current queue: score ${item.score} = ${arithmeticPart}.`
      }
    }

    return {
      ...item,
      rank: index + 1,
      tieBreakSentence,
    }
  })
}
