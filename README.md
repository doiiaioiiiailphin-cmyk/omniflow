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
- npm or pnpm

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

### Build

```bash
npm run electron:build
```

## Configuration

1. Launch OmniFlow
2. Click the gear icon in the bottom-right to open Settings
3. Add your LLM configuration (provider, model, API key)
4. Select a working directory for file operations

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
