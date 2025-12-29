import { resolvePath } from '../../utils/fs.js'
import { findPolicyFile, loadPolicy } from '../../policy/load-policy.js'
import { parseLockfile } from '../../installer/parse-lockfile.js'
import { detectScripts } from '../../installer/detect-scripts.js'
import { matchScriptsAgainstPolicy } from '../../policy/match-scripts.js'
import { runNpmInstall } from '../../installer/run-install.js'
import { runApprovedScripts } from '../../installer/run-approved-scripts.js'
import { reportToConsole } from '../../reporters/console-reporter.js'
import { reportToJson } from '../../reporters/json-reporter.js'
import { PolicyViolationError } from '../../errors/policy-violation-error.js'
import { logger } from '../../utils/logger.js'
import { LOCKFILE_NAMES } from '../../constants/index.js'
import { fileExists } from '../../utils/fs.js'
import type { CLIArgs, ReporterOutput, DetectedScript, PolicyViolation } from '../../types/index.js'

function findLockfile(projectRoot: string): string {
  for (const lockfileName of LOCKFILE_NAMES) {
    const lockfilePath = resolvePath(projectRoot, lockfileName)
    if (fileExists(lockfilePath)) {
      return lockfilePath
    }
  }
  throw new Error('No lockfile found. Please run npm install first.')
}

function createReporterOutput(
  approved: DetectedScript[],
  violations: PolicyViolation[],
  blocked: DetectedScript[]
): ReporterOutput {
  const totalDetected = approved.length + violations.length + blocked.length

  return {
    approved,
    violations,
    blocked,
    summary: {
      totalDetected,
      totalApproved: approved.length,
      totalViolations: violations.length,
      totalBlocked: blocked.length
    }
  }
}

export async function runCommand(
  args: CLIArgs,
  projectRoot: string = process.cwd()
): Promise<void> {
  const policyPath = args.policy
    ? resolvePath(projectRoot, args.policy)
    : findPolicyFile(projectRoot)

  logger.info('Loading policy...')
  const policy = loadPolicy(policyPath)

  if (!args.audit) {
    logger.info('Running npm install with --ignore-scripts...')
    await runNpmInstall(projectRoot, true)
  }

  logger.info('Parsing lockfile...')
  const lockfilePath = findLockfile(projectRoot)
  const dependencies = parseLockfile(lockfilePath)

  logger.info('Detecting lifecycle scripts...')
  const detectedScripts = detectScripts(dependencies, projectRoot)

  logger.info('Matching scripts against policy...')
  const matchResult = matchScriptsAgainstPolicy(detectedScripts, policy)

  const output = createReporterOutput(
    matchResult.approved,
    matchResult.violations,
    matchResult.blocked
  )

  if (args.json) {
    console.log(reportToJson(output))
  } else {
    reportToConsole(output, args.ci)
  }

  if (matchResult.violations.length > 0 && args.ci) {
    throw new PolicyViolationError(matchResult.violations)
  }

  if (!args.audit && matchResult.approved.length > 0) {
    await runApprovedScripts(matchResult.approved, projectRoot)
  }
}

