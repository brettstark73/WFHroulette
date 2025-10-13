# Claude GitHub Integration

This repository has an integrated Claude AI assistant that you can mention in GitHub issues to get help, answers, and automated task execution.

## Quick Start

### Initial Setup (One-time)

```bash
# Run the setup script
.github/scripts/setup-claude.sh
```

This will:
1. Verify GitHub CLI authentication
2. Prompt for your Anthropic API key
3. Save it securely to GitHub Secrets

### Using Claude from Issues

Simply mention `@claude` in any issue or comment:

```
@claude run the test suite and report results
```

```
@claude explain how the ISO week calculation works
```

```
@claude should we add a refresh button to let users generate a new excuse?
```

## What Claude Can Do

### ✅ Automated Tasks
- **Run tests**: `@claude run tests` → Executes test suite, reports results
- **Answer questions**: Ask about code, architecture, or features
- **Provide guidance**: Get suggestions for improvements or solutions
- **Analyze code**: Request explanations of how things work

### ⚠️ Limitations
- **Cannot directly modify files** - Will describe changes needed
- **Limited to 10 minutes** - GitHub Actions timeout
- **Best for simple tasks** - Complex refactoring needs local Claude Code

### 📝 Examples

**Question:**
```
@claude how does the deterministic excuse selection work?
```
Response: Claude explains the hash-based algorithm in `src/util.js`

**Testing:**
```
@claude run the test suite
```
Response: Executes `npm test` and shows results

**Feature Discussion:**
```
@claude should users be able to refresh their excuse if they don't like it?
```
Response: Claude provides pros/cons analysis and implementation suggestions

**Code Review:**
```
@claude review the changes in reasons.json - are these excuses appropriate?
```
Response: Claude analyzes content and provides feedback

## How It Works

### Architecture

1. **Trigger**: GitHub Actions detects `@claude` mention
2. **Context Gathering**: Reads repo structure, README, key files
3. **API Call**: Sends task + context to Anthropic's Claude API
4. **Response**: Claude analyzes and responds
5. **Execution**: Safe commands (like `npm test`) run automatically
6. **Report**: Results posted back to the issue

### Workflow File

`.github/workflows/claude-integration.yml` orchestrates the process:
- Triggers on issue creation/comments
- Extracts task from `@claude` mention (handles apostrophes correctly!)
- Calls Node.js processor script
- Posts results back to issue

### Processor Script

`.github/scripts/claude-processor.js`:
- Gathers repository context (files, structure, README)
- Calls Anthropic Messages API with system prompt
- Executes safe commands if Claude suggests them
- Formats and returns response

## Security

### API Key Storage
- `ANTHROPIC_API_KEY` stored in **GitHub Secrets** (encrypted)
- Never committed to repository
- Only accessible to GitHub Actions workflows

### Command Execution
- Only safe, pre-approved commands execute automatically:
  - `npm test` (test suite)
  - Read-only operations
- File modifications require manual approval

### Permissions
Workflow has minimal required permissions:
- `issues: write` - Post comments
- `contents: write` - Read code (no writes happen automatically)
- `pull-requests: write` - Future: Create PRs with suggested changes

## Cost Considerations

**Anthropic API Pricing** (as of 2024):
- Claude 3.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- Typical request: ~2,000 input tokens, ~500 output tokens
- **Cost per request: ~$0.01** (one penny)

**GitHub Actions** (Free tier):
- 2,000 minutes/month free for public repos
- Unlimited for public repos (this one is public)
- Each Claude request uses ~30 seconds of compute

**Recommendation**: Even with heavy use, costs are minimal (<$5/month).

## Troubleshooting

### Claude Doesn't Respond

1. **Check workflow runs**: `gh run list --workflow=claude-integration.yml`
2. **View logs**: `gh run view [run-id] --log`
3. **Verify API key**: `gh secret list` (should show ANTHROPIC_API_KEY)

### Workflow Fails

```bash
# View the most recent failed run
gh run list --workflow=claude-integration.yml --status=failure --limit=1
gh run view --log-failed
```

Common issues:
- **API key missing**: Run setup script again
- **API rate limit**: Wait a few minutes
- **Invalid task**: Make sure @claude mention is clear

### API Key Expired

```bash
# Update the secret
gh secret set ANTHROPIC_API_KEY
# Paste new key when prompted
```

## Advanced Usage

### Local Testing

Test the processor script locally:

```bash
export ANTHROPIC_API_KEY="your-key"
export TASK="run tests"
export REPO_NAME="brettstark73/WFHroulette"
export ISSUE_NUMBER="123"
export GITHUB_OUTPUT="/tmp/output.txt"

node .github/scripts/claude-processor.js
cat /tmp/output.txt
```

### Extending Capabilities

Edit `.github/scripts/claude-processor.js` to:
- Add more safe commands (e.g., `npm run build`)
- Include more context files
- Adjust Claude's system prompt
- Change response formatting

### Disabling Integration

Temporarily disable without deleting:

```bash
# Disable the workflow
gh workflow disable claude-integration.yml

# Re-enable later
gh workflow enable claude-integration.yml
```

## Comparison to Manual Claude Code

| Feature | GitHub @claude | Local Claude Code |
|---------|----------------|-------------------|
| **Speed** | ~30 seconds | Instant |
| **Capabilities** | Answers, tests, guidance | Full code editing |
| **Convenience** | Works from mobile | Requires terminal |
| **Context** | Limited (50 files) | Full codebase |
| **Best For** | Quick questions, tests | Complex refactoring |

**Recommendation**: Use @claude for quick tasks from mobile, local Claude Code for development work.

## Examples from This Repo

### Issue #6: Refresh Feature Discussion
```
@claude Should user be able to refresh excuse if they don't like it?
Or if they change the date or pick a different week?
```

Claude's response:
- Analyzed deterministic design philosophy
- Discussed trade-offs of adding refresh
- Suggested implementation approaches if desired
- No errors about apostrophes! 🎉

---

**Questions?** Create an issue and ask `@claude` for help!
