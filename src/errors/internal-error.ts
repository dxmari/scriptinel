import { ScriptinelError } from './index.js'
import { EXIT_CODES } from '../constants/index.js'

export class InternalError extends ScriptinelError {
  readonly exitCode = EXIT_CODES.INTERNAL_FAILURE
  readonly code = 'INTERNAL_FAILURE'

  constructor(message: string, context?: Record<string, unknown>) {
    super(`Internal error: ${message}`, context)
  }
}

