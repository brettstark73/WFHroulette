#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pickWFHDay, pickReason, formatDay } from './util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function showHelp() {
  console.log(`WFHroulette CLI

Usage:
  wfhroulette [--seed value] [--date YYYY-MM-DD] [--employee-id value] [--json]

Options:
  --seed <value>        Seed to use for deterministic hashing (default: "default").
  --date YYYY-MM-DD     Anchor date for ISO week calculation (default: today).
  --employee-id <value> Employee ID for unique excuse selection (optional).
  --json                Output JSON instead of formatted text.
  --help                Show this help message.
`)
}

function parseArgs(argv) {
  const options = {
    seed: 'default',
    date: null,
    employeeId: null,
    json: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg.startsWith('--seed=')) {
      options.seed = arg.slice(7)
      continue
    }
    if (arg === '--seed') {
      options.seed = argv[i + 1] ?? ''
      i += 1
      continue
    }
    if (arg.startsWith('--date=')) {
      options.date = arg.slice(7)
      continue
    }
    if (arg === '--date') {
      options.date = argv[i + 1] ?? null
      i += 1
      continue
    }
    if (arg.startsWith('--employee-id=')) {
      options.employeeId = arg.slice(14)
      continue
    }
    if (arg === '--employee-id') {
      options.employeeId = argv[i + 1] ?? null
      i += 1
      continue
    }
    console.error(`Unknown argument: ${arg}`)
    options.help = true
    return options
  }

  return options
}

function loadReasons() {
  const reasonsPath = path.resolve(__dirname, '../reasons.json')
  const raw = fs.readFileSync(reasonsPath, 'utf-8')
  return JSON.parse(raw)
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    showHelp()
    return
  }

  let baseDate = options.date
    ? new Date(`${options.date}T00:00:00Z`)
    : new Date()
  if (Number.isNaN(baseDate.getTime())) {
    console.error(`Invalid date provided: ${options.date}`)
    process.exitCode = 1
    return
  }

  const reasons = loadReasons()
  const result = pickWFHDay(options.seed, baseDate)
  const reason = pickReason(options.seed, result, reasons, options.employeeId)
  const formatted = formatDay(result.date)
  const isoDate = result.date.toISOString().slice(0, 10)

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          seed: options.seed,
          employeeId: options.employeeId,
          isoWeek: result.isoWeek,
          isoYear: result.isoYear,
          date: isoDate,
          weekday: formatted.split(',')[0],
          reason,
        },
        null,
        2
      )
    )
    return
  }

  console.log(`${formatted}\nExcuse: ${reason}`)
}

main()
