# OmniFlow

**Multi-Agent Collaborative Desktop Tool for Information Processing**

OmniFlow is a desktop application that orchestrates multiple AI agents to streamline information processing, content generation, and decision-making tasks. Instead of switching between multiple tools, users can complete complex workflows in one place.

## Architecture

OmniFlow uses a **DAG (Directed Acyclic Graph) workflow engine** to coordinate 5 specialized agents:

| Agent | Role | Description |
|---|---|---|
| **Orchestrator** | Task Decomposition | Understands user intent, breaks tasks into DAG subtasks |
| **Retriever** | Information Retrieval | Searches files, web, knowledge bases |
| **Summarizer** | Synthesis | Merges, refines, deduplicates information |
| **Generator** | Content Creation | Writes reports, emails, code, documents |
| **Verifier** | Quality Check | Validates completeness, accuracy, consistency |

The Orchestrator → Verifier → Generator loop enables multi-round optimization (up to 3 iterations).

## Features

- **Multi-Agent Collaboration** - DAG-based task decomposition with parallel/serial execution
- **Skill System** - Compatible with OpenCode skill format, extensible with custom skills
- **Multi-Model Support** - OpenAI, Anthropic, Google Gemini, DeepSeek, Ollama, OpenRouter
- **Real-time DAG Visualization** - Watch agent collaboration in real-time with ReactFlow
- **File Tree Integration** - Select working directory, browse and read local files
- **Conversation History** - Auto-saved conversations per workspace
- **Desktop App** - Built with Electron + React + TypeScript

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, ReactFlow v12, Zustand
- **Backend**: Electron, Node.js
- **Build**: Vite, electron-builder

## Getting Started

### Prerequisites

- Node.js 18+

### CLI (Command Line)

```bash
# Install globally
npm install -g omniflow

# One-shot task execution
omniflow run "整理项目进度报告"

# Interactive REPL mode
omniflow repl

# Specify model
omniflow --model openai:gpt-4o run "分析合同风险"

# Pipe input
echo "总结这篇文章" | omniflow run

# Save output to file
omniflow run "生成周报" -o report.md

# Manage LLM configs
omniflow config add openai gpt-4o sk-xxx
omniflow config list

# Manage skills
omniflow skill list
omniflow skill add ./my-skill
```

### Desktop App

```bash
# Install dependencies
npm install

# Development mode
npm run electron:dev

# Build installers
npm run electron:build
# Output: release/OmniFlow Setup 1.0.0.exe (NSIS installer)
#         release/OmniFlow-1.0.0-win.zip (Portable)
```

## Configuration

### GUI
1. Launch OmniFlow
2. Click the gear icon in the bottom-right to open Settings
3. Add your LLM configuration (provider, model, API key)
4. Select a working directory for file operations

### CLI
```bash
# Add a model
omniflow config add openai gpt-4o sk-your-key

# List configured models
omniflow config list
```

Settings stored at `~/.omniflow/settings.json`


## Skills

OmniFlow supports the OpenCode skill format. To add a skill:

1. Create a directory with a `SKILL.md` file
2. Click the puzzle icon in the bottom bar
3. Add the skill directory

Built-in skills:
- **contract-review** - Contract risk analysis
- **meeting-minutes** - Meeting minutes generation
- **web-search** - Web search integration

## License

MIT
