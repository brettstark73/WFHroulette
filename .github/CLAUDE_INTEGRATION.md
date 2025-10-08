# Claude Code GitHub Integration

This repository is configured for Claude Code integration, allowing you to @mention Claude from GitHub issues.

## Setup

### 1. GitHub Secrets Configuration

Add your Anthropic API key to repository secrets:

```bash
gh secret set ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key.

### 2. Workflow Permissions

The `.github/workflows/claude-code.yml` workflow requires:
- `issues: write` - To comment on issues
- `contents: write` - To make code changes
- `pull-requests: write` - To create PRs

These are configured in the workflow file.

## Usage

### From GitHub Mobile/Web

Create or comment on an issue with:

```
@claude please add a new excuse to reasons.json about coffee
```

```
@claude: run the test suite and fix any failures
```

```
@claude can you update the README with deployment instructions?
```

The workflow will:
1. Detect the @claude mention
2. Post an acknowledgment comment
3. Execute basic automated tasks (tests, checks)
4. Post results back to the issue

### For Complex Tasks

For tasks requiring interactive coding, the bot will suggest running Claude Code locally:

```bash
cd /path/to/WFHroulette
claude
```

Then reference the GitHub issue number in your session.

## Architecture

### Workflow Triggers
- `issue_comment.created` - New comments on issues
- `issues.opened` - New issues created
- `issues.edited` - Issue body edited

### Task Processing
The workflow currently handles:
- Running test suite
- Basic validation checks
- Acknowledgment and status updates

### Extending Automation

To add more automated capabilities, edit `.github/workflows/claude-code.yml`:

```yaml
- name: Process Claude task
  run: |
    # Add custom logic based on $TASK variable
    if echo "$TASK" | grep -i "test"; then
      npm test
    elif echo "$TASK" | grep -i "build"; then
      npm run build
    fi
```

## Security

- **API Key**: Store `ANTHROPIC_API_KEY` in GitHub Secrets (never commit)
- **Permissions**: Workflow has minimal required permissions
- **Rate Limiting**: GitHub Actions has usage limits (2000 min/month free tier)

## Limitations

- Best for simple, automatable tasks
- Complex refactoring/features require local Claude Code session
- GitHub Actions runner has time limits (6 hours max)
- No interactive conversation in issues

## Examples

### Simple Task (Automated)
```
Issue: @claude run tests
Response: ✅ Tests passed (19/19)
```

### Complex Task (Manual Recommended)
```
Issue: @claude redesign the web UI with dark mode
Response: ⚠️  This task requires interactive development.
         Please run `claude` locally and reference issue #123.
```

---

**Note**: This integration is optimized for the WFHroulette project structure. Adjust workflows as needed for your use case.
