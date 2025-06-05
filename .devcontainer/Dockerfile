FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install Node.js and Claude Code CLI
RUN apt-get update &&             curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&             apt-get install -y nodejs &&             npm install -g @anthropic-ai/claude-code

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
