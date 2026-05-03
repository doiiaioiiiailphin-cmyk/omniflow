import { LLMConfig } from '../types'
import * as fs from 'fs'
import { execSync } from 'child_process'

export interface ToolDef {
  name: string
  description: string
  parameters: Record<string, { type: string; description: string }>
}

export const AGENT_TOOLS: ToolDef[] = [
  {
    name: 'read_file',
    description: 'Read a file from the filesystem. Use this to read local files the user references.',
    parameters: {
      path: { type: 'string', description: 'Absolute or relative file path to read' },
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Use this to save generated content or modify existing files.',
    parameters: {
      path: { type: 'string', description: 'Path to write the file to' },
      content: { type: 'string', description: 'Content to write to the file' },
    },
  },
  {
    name: 'exec_command',
    description: 'Execute a shell command and return its output. Use sparingly for system operations.',
    parameters: {
      command: { type: 'string', description: 'The command to execute' },
    },
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a given path.',
    parameters: {
      path: { type: 'string', description: 'Directory path to list' },
    },
  },
]

export function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  workDir: string
): string {
  try {
    switch (name) {
      case 'read_file': {
        const p = args.path as string
        const resolved = p.startsWith('/') || p.includes(':') ? p : `${workDir}/${p}`
        return fs.readFileSync(resolved, 'utf-8')
      }
      case 'write_file': {
        const p = args.path as string
        const resolved = p.startsWith('/') || p.includes(':') ? p : `${workDir}/${p}`
        const content = args.content as string
        const dir = require('path').dirname(resolved)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(resolved, content, 'utf-8')
        return `File written successfully: ${resolved}`
      }
      case 'exec_command': {
        const cmd = args.command as string
        const result = execSync(cmd, {
          encoding: 'utf-8',
          timeout: 30000,
          maxBuffer: 1024 * 1024,
          cwd: workDir,
        })
        return result
      }
      case 'list_directory': {
        const p = (args.path as string) || workDir
        const resolved = p.startsWith('/') || p.includes(':') ? p : `${workDir}/${p}`
        const entries = fs.readdirSync(resolved, { withFileTypes: true })
        return entries
          .map(e => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`)
          .sort()
          .join('\n')
      }
      default:
        return `Unknown tool: ${name}`
    }
  } catch (err) {
    return `Tool error (${name}): ${err instanceof Error ? err.message : String(err)}`
  }
}

export function toolsToOpenAIFormat(tools: ToolDef[]): Array<Record<string, unknown>> {
  return tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(t.parameters).map(([k, v]) => [k, { type: v.type, description: v.description }])
        ),
        required: Object.keys(t.parameters),
      },
    },
  }))
}
