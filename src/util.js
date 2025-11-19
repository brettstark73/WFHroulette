const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function normalizeDate(input) {
  if (input instanceof Date) {
    return new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate())
    )
  }
  const parsed = new Date(input ?? Date.now())
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${input}`)
  }
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  )
}

export function isoWeekInfo(input = new Date()) {
  const target = normalizeDate(input)
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)

  const year = target.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7)

  const firstMonday = new Date(Date.UTC(year, 0, 4))
  const firstMondayDay = firstMonday.getUTCDay() || 7
  firstMonday.setUTCDate(firstMonday.getUTCDate() + 1 - firstMondayDay)
  const monday = new Date(firstMonday)
  monday.setUTCDate(monday.getUTCDate() + (week - 1) * 7)

  return { year, week, monday }
}

export function simpleHash(value) {
  const text = String(value ?? '')
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

export function pickWFHDay(seed = 'default', dateInput = new Date()) {
  const info = isoWeekInfo(dateInput)
  const base = `${seed}|${info.year}|${info.week}|day`
  const offset = simpleHash(base) % DAY_NAMES.length
  const wfhDate = new Date(info.monday)
  wfhDate.setUTCDate(wfhDate.getUTCDate() + offset)
  return { date: wfhDate, isoYear: info.year, isoWeek: info.week }
}

export function pickReason(
  seed = 'default',
  weekInfo,
  reasons = [],
  employeeId = null
) {
  if (!Array.isArray(reasons) || reasons.length === 0) {
    throw new Error('reasons array must contain at least one item')
  }
  const { isoYear, isoWeek } = weekInfo || {}
  if (typeof isoYear !== 'number' || typeof isoWeek !== 'number') {
    throw new Error('weekInfo with isoYear and isoWeek is required')
  }
  // Add employeeId to make each team member get different excuses
  const base = employeeId
    ? `${seed}|${isoYear}|${isoWeek}|reason|${employeeId}`
    : `${seed}|${isoYear}|${isoWeek}|reason`
  const index = simpleHash(base) % reasons.length
  // eslint-disable-next-line security/detect-object-injection -- Safe: index is bounded by modulo operation
  return reasons[index]
}

export function formatDay(dateInput) {
  const date = normalizeDate(dateInput)
  const weekday = date.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  })
  const iso = date.toISOString().slice(0, 10)
  return `${weekday}, ${iso}`
}
