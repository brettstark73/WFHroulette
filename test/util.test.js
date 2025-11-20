#!/usr/bin/env node

// Simple test runner - no dependencies
import {
  isoWeekInfo,
  pickWFHDay,
  pickReason,
  formatDay,
  simpleHash,
} from '../src/util.js'

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`)
  }
}

function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`)
    process.exit(1)
  }
}

// Test data
const testReasons = ['Reason 1', 'Reason 2', 'Reason 3']

// Hash function tests
test('simpleHash produces consistent results', () => {
  assertEqual(
    simpleHash('test'),
    simpleHash('test'),
    'Same input should produce same hash'
  )
  assertEqual(typeof simpleHash('test'), 'number', 'Hash should return number')
})

test('simpleHash handles edge cases', () => {
  assertEqual(
    simpleHash(''),
    simpleHash(''),
    'Empty string should be consistent'
  )
  assertEqual(simpleHash(null), simpleHash(null), 'Null should be consistent')
  assertEqual(
    simpleHash(undefined),
    simpleHash(undefined),
    'Undefined should be consistent'
  )
})

// ISO week tests
test('isoWeekInfo calculates correct week for known date', () => {
  const result = isoWeekInfo(new Date('2025-09-25T00:00:00Z'))
  assertEqual(result.year, 2025, 'Year should be 2025')
  assertEqual(result.week, 39, 'Week should be 39')
  assertEqual(result.monday.getUTCDay(), 1, 'Monday should have day 1')
})

test('isoWeekInfo handles year boundaries', () => {
  // Test a date that might be in different ISO year
  const result = isoWeekInfo(new Date('2025-01-01T00:00:00Z'))
  assertEqual(typeof result.year, 'number', 'Year should be number')
  assertEqual(typeof result.week, 'number', 'Week should be number')
  assertEqual(result.monday.getUTCDay(), 1, 'Monday should have day 1')
})

// WFH day picking tests
test('pickWFHDay is deterministic', () => {
  const date = new Date('2025-09-25T00:00:00Z')
  const result1 = pickWFHDay('test-seed', date)
  const result2 = pickWFHDay('test-seed', date)

  assertEqual(
    result1.date.getTime(),
    result2.date.getTime(),
    'Same seed/date should produce same result'
  )
  assertEqual(result1.isoYear, result2.isoYear, 'ISO year should match')
  assertEqual(result1.isoWeek, result2.isoWeek, 'ISO week should match')
})

test('pickWFHDay produces different results for different seeds', () => {
  const date = new Date('2025-09-25T00:00:00Z')
  const result1 = pickWFHDay('seed1', date)
  const result2 = pickWFHDay('seed2', date)

  // High probability they're different (could theoretically be same)
  const different = result1.date.getTime() !== result2.date.getTime()
  if (!different) {
    console.warn(
      '  Warning: Different seeds produced same date (low probability but possible)'
    )
  }
})

test('pickWFHDay returns valid weekday (Mon-Fri)', () => {
  const date = new Date('2025-09-25T00:00:00Z')
  const result = pickWFHDay('test-seed', date)
  const dayOfWeek = result.date.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  assertEqual(isWeekday, true, 'Should return Mon-Fri only')
})

// Reason picking tests
test('pickReason is deterministic', () => {
  const weekInfo = { isoYear: 2025, isoWeek: 39 }
  const reason1 = pickReason('test-seed', weekInfo, testReasons)
  const reason2 = pickReason('test-seed', weekInfo, testReasons)

  assertEqual(reason1, reason2, 'Same seed/week should produce same reason')
})

test('pickReason throws on invalid input', () => {
  try {
    pickReason('seed', { isoYear: 2025, isoWeek: 39 }, [])
    throw new Error('Should have thrown for empty reasons')
  } catch (error) {
    if (!error.message.includes('at least one item')) {
      throw error
    }
  }

  try {
    pickReason('seed', { isoWeek: 39 }, testReasons)
    throw new Error('Should have thrown for missing isoYear')
  } catch (error) {
    if (!error.message.includes('isoYear and isoWeek is required')) {
      throw error
    }
  }
})

// Date formatting tests
test('formatDay formats dates correctly', () => {
  const date = new Date('2025-09-25T00:00:00Z')
  const formatted = formatDay(date)

  assertEqual(formatted.includes('2025-09-25'), true, 'Should include ISO date')
  assertEqual(
    formatted.includes('Thursday'),
    true,
    'Should include weekday name'
  )
})

test('formatDay handles different dates', () => {
  const date1 = new Date('2025-01-01T00:00:00Z')
  const date2 = new Date('2025-12-31T00:00:00Z')

  const formatted1 = formatDay(date1)
  const formatted2 = formatDay(date2)

  assertEqual(
    formatted1.includes('2025-01-01'),
    true,
    'Should format first day of year'
  )
  assertEqual(
    formatted2.includes('2025-12-31'),
    true,
    'Should format last day of year'
  )
  assertEqual(
    formatted1 !== formatted2,
    true,
    'Different dates should format differently'
  )
})

// Integration test
test('Full workflow integration', () => {
  const seed = 'integration-test'
  const date = new Date('2025-09-25T00:00:00Z')

  // Should not throw and produce valid results
  const wfhResult = pickWFHDay(seed, date)
  const reason = pickReason(seed, wfhResult, testReasons)
  const formatted = formatDay(wfhResult.date)

  assertEqual(typeof reason, 'string', 'Reason should be string')
  assertEqual(
    testReasons.includes(reason),
    true,
    'Reason should be from test array'
  )
  assertEqual(typeof formatted, 'string', 'Formatted date should be string')
  assertEqual(
    formatted.length > 10,
    true,
    'Formatted date should be meaningful length'
  )
})

console.log('\nAll tests passed! ✅')
