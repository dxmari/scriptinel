import type { CLIArgs } from '../types/index.js'

export function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    ci: false,
    audit: false,
    json: false
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === 'approve') {
      result.command = 'approve'
      if (i + 1 < args.length) {
        const nextArg = args[i + 1]
        if (nextArg !== undefined) {
          result.packageName = nextArg
        }
        i += 2
      } else {
        throw new Error('Missing package name for approve command')
      }
      continue
    }

    if (arg === '--ci') {
      result.ci = true
      i++
      continue
    }

    if (arg === '--audit') {
      result.audit = true
      i++
      continue
    }

    if (arg === '--json') {
      result.json = true
      i++
      continue
    }

    if (arg === '--policy' && i + 1 < args.length) {
      const nextArg = args[i + 1]
      if (nextArg !== undefined) {
        result.policy = nextArg
      }
      i += 2
      continue
    }

    if (arg !== undefined && arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`)
    }

    i++
  }

  if (!result.command) {
    result.command = 'run'
  }

  return result
}

