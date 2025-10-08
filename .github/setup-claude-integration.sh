#!/bin/bash
# Setup script for Claude Code GitHub integration

set -e

echo "🤖 Setting up Claude Code GitHub Integration"
echo "============================================="
echo ""

# Check if gh CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI not authenticated. Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Check for ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo ""
    echo "⚠️  ANTHROPIC_API_KEY not found in environment"
    echo ""
    echo "To set up the integration, you need to add your Anthropic API key:"
    echo ""
    echo "  1. Get your API key from: https://console.anthropic.com/settings/keys"
    echo "  2. Run: gh secret set ANTHROPIC_API_KEY"
    echo "  3. Paste your API key when prompted"
    echo ""
    read -p "Do you want to set it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh secret set ANTHROPIC_API_KEY
        echo "✅ API key configured"
    else
        echo "⏭️  Skipping API key setup (you can do this later)"
    fi
else
    echo "✅ ANTHROPIC_API_KEY found in environment"
    echo ""
    read -p "Do you want to update the GitHub secret? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$ANTHROPIC_API_KEY" | gh secret set ANTHROPIC_API_KEY
        echo "✅ API key configured"
    fi
fi

echo ""
echo "✅ GitHub workflow created at: .github/workflows/claude-code.yml"
echo "✅ Documentation created at: .github/CLAUDE_INTEGRATION.md"
echo ""
echo "📖 Usage:"
echo "  - Create an issue or comment with: @claude [your request]"
echo "  - Example: @claude please run the test suite"
echo "  - Example: @claude add a new excuse about meetings"
echo ""
echo "🎉 Setup complete!"
