#!/bin/bash
# Setup script for Claude GitHub Integration

set -e

echo ""
echo "🤖 Claude GitHub Integration Setup"
echo "===================================="
echo ""

# Check gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &>/dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo ""
    echo "📝 You need an Anthropic API key for this integration"
    echo "   Get one at: https://console.anthropic.com/settings/keys"
    echo ""
    read -p "Enter your Anthropic API key: " api_key

    if [ -z "$api_key" ]; then
        echo "❌ No API key provided"
        exit 1
    fi

    # Set the secret
    echo "$api_key" | gh secret set ANTHROPIC_API_KEY
    echo "✅ API key saved to GitHub Secrets"
else
    echo "✅ ANTHROPIC_API_KEY found in environment"
    echo ""
    read -p "Update GitHub secret with this key? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$ANTHROPIC_API_KEY" | gh secret set ANTHROPIC_API_KEY
        echo "✅ API key updated"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📖 Usage:"
echo "   Create or comment on an issue with: @claude [your request]"
echo ""
echo "Examples:"
echo "   @claude run the test suite"
echo "   @claude explain how the ISO week calculation works"
echo "   @claude should we add a refresh button?"
echo ""
echo "Note: Claude will respond in the issue with suggestions and answers."
echo "      For complex code changes, it will guide you on what to do locally."
echo ""
