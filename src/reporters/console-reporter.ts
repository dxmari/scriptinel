import { logger } from '../utils/logger.js'
import { formatViolations } from './report-violations.js'
import type { ReporterOutput } from '../types/index.js'

export function reportToConsole(output: ReporterOutput, isCI: boolean): void {
  const log = isCI ? logger : logger

  if (output.violations.length > 0) {
    const messages = formatViolations(output.violations)
    for (const message of messages) {
      log.warn(message)
    }
  }

  if (output.blocked.length > 0) {
    log.warn(`\nBlocked ${output.blocked.length} script(s) from execution`)
    for (const script of output.blocked) {
      log.warn(
        `  • ${script.packageName}@${script.version} - ${script.script}`
      )
    }
  }

  if (output.approved.length > 0) {
    log.info(`\nApproved ${output.approved.length} script(s) for execution`)
  }

  log.info(
    `\nSummary: ${output.summary.totalDetected} detected, ${output.summary.totalApproved} approved, ${output.summary.totalViolations} violations, ${output.summary.totalBlocked} blocked`
  )
}

