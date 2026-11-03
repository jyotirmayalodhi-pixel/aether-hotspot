export const CATEGORY_WEIGHTS = {
  Laboratory: 3,
  'Wi-Fi': 2,
  Hostel: 2,
  Classroom: 1,
} as const

export const MAX_HEAT_SCORE = 10

export const DESCRIPTION_MIN = 10
export const DESCRIPTION_MAX = 280

export const CRITICAL_KEYWORDS_REGEX =
  /\b(fire|spark|short circuit|leak|outage|blackout|exam|broken)\b/i
