import { ScriptinelError } from './index.js'
import { EXIT_CODES } from '../constants/index.js'
import type { PolicyViolation } from '../types/index.js'

export class PolicyViolationError extends ScriptinelError {
  readonly exitCode = EXIT_CODES.POLICY_VIOLATION
  readonly code = 'POLICY_VIOLATION'

  constructor(public readonly violations: PolicyViolation[]) {
    const packageNames = violations.map(v => v.packageName).join(', ')
    super(
      `Policy violation: ${violations.length} unapproved script(s) detected in package(s): ${packageNames}`,
      { violations }
    )
  }
}

