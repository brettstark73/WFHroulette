#!/usr/bin/env node

/**
 * Claude GitHub Integration Processor
 * Calls Anthropic API to process @claude requests from GitHub issues
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { execSync } from 'child_process'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const TASK = process.env.TASK
const REPO_NAME = process.env.REPO_NAME
const ISSUE_NUMBER = process.env.ISSUE_NUMBER

// GitHub Actions output helpers
function setOutput(name, value) {
  const output = `${name}<<EOF\n${value}\nEOF`
  writeFileSync(process.env.GITHUB_OUTPUT, output + '\n', { flag: 'a' })
}

function setSuccess(success) {
  writeFileSync(process.env.GITHUB_OUTPUT, `success=${success}\n`, { flag: 'a' })
}

// Gather repository context
function getRepoContext() {
  const context = {
    files: [],
    structure: '',
    readme: '',
    packageJson: {}
  }

  try {
    // Get file structure (limited depth)
    const tree = execSync('find . -not -path "*/node_modules/*" -not -path "*/.git/*" -type f | head -50', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    })
    context.structure = tree

    // Read README if exists
    try {
      context.readme = readFileSync('README.md', 'utf8')
    } catch (e) {
      // No README
    }

    // Read package.json
    try {
      context.packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    } catch (e) {
      // No package.json
    }

    // Get key source files
    const keyFiles = ['src/cli.js', 'src/util.js', 'web/app.js', 'web/index.html', 'reasons.json']
    for (const file of keyFiles) {
      try {
        const content = readFileSync(file, 'utf8')
        if (content.length < 5000) { // Only include reasonably sized files
          context.files.push({ path: file, content })
        }
      } catch (e) {
        // File doesn't exist
      }
    }
  } catch (error) {
    console.error('Error gathering context:', error.message)
  }

  return context
}

// Call Anthropic API
async function callClaude(task, context) {
  const systemPrompt = `You are Claude, an AI assistant integrated into a GitHub repository (${REPO_NAME}) via GitHub Actions.

You are helping with issue #${ISSUE_NUMBER}. The user has made a request that you should fulfill if possible.

Repository context:
- Project: ${context.packageJson.name || 'Unknown'}
- Description: ${context.packageJson.description || 'No description'}

Available commands you can suggest:
- npm test (run tests)
- npm run web (start web server)
- File modifications (describe what to change)

Constraints:
- Keep responses concise (under 500 words)
- Be practical and actionable
- You cannot directly modify files, but can describe changes needed
- You can suggest running tests or other npm scripts
- For complex tasks, acknowledge limitations and suggest manual steps

README summary:
${context.readme.substring(0, 1000)}

File structure:
${context.structure.substring(0, 500)}`

  const userPrompt = `User request: ${task}

Please provide a helpful response. For simple questions, answer directly. For code changes, describe what should be changed. For tasks like running tests, I can execute npm commands.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Execute simple commands if Claude suggests them
function executeIfSafe(claudeResponse) {
  const results = []

  // Check if Claude suggested running tests
  if (claudeResponse.toLowerCase().includes('npm test') ||
      claudeResponse.toLowerCase().includes('run the tests')) {
    try {
      console.log('Running tests as suggested...')
      const output = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' })
      results.push('Tests executed:\n```\n' + output.substring(0, 1000) + '\n```')
    } catch (error) {
      results.push('Tests failed:\n```\n' + error.message + '\n```')
    }
  }

  return results
}

// Main execution
async function main() {
  try {
    console.log('Processing task:', TASK)

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set')
    }

    if (!TASK || TASK.trim() === '') {
      throw new Error('No task provided')
    }

    // Gather context
    console.log('Gathering repository context...')
    const context = getRepoContext()

    // Call Claude
    console.log('Calling Anthropic API...')
    const claudeResponse = await callClaude(TASK, context)

    console.log('Claude response received:', claudeResponse.substring(0, 100) + '...')

    // Execute safe commands if suggested
    const execResults = executeIfSafe(claudeResponse)

    // Combine response
    let finalResponse = claudeResponse
    if (execResults.length > 0) {
      finalResponse += '\n\n---\n\n**Execution Results:**\n\n' + execResults.join('\n\n')
    }

    // Set outputs
    setOutput('response', finalResponse)
    setSuccess(true)

    console.log('Success!')
  } catch (error) {
    console.error('Error:', error)
    setOutput('response', `**Error:** ${error.message}\n\nFor complex tasks, please run \`claude\` locally and reference issue #${ISSUE_NUMBER}.`)
    setSuccess(false)
    process.exit(0) // Don't fail the workflow
  }
}

main()
