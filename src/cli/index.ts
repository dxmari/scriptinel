#!/usr/bin/env node

import { parseArgs } from './parse-args.js'
import { runCommand } from './commands/run.js'
import { approveCommand } from './commands/approve.js'
import { ScriptinelError } from '../errors/index.js'
import { EXIT_CODES } from '../constants/index.js'
import { logger } from '../utils/logger.js'

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2))

    if (args.command === 'approve') {
      await approveCommand(args)
    } else {
      await runCommand(args)
    }

    process.exit(EXIT_CODES.SUCCESS)
  } catch (error) {
    if (error instanceof ScriptinelError) {
      logger.error(error.message)
      process.exit(error.exitCode)
    }

    if (error instanceof Error) {
      logger.error(error.message)
      process.exit(EXIT_CODES.INTERNAL_FAILURE)
    }

    logger.error('Unknown error occurred')
    process.exit(EXIT_CODES.INTERNAL_FAILURE)
  }
}

main().catch(error => {
  logger.error(error instanceof Error ? error.message : 'Unknown error')
  process.exit(EXIT_CODES.INTERNAL_FAILURE)
})

