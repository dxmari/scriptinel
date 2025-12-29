import { resolvePath } from '../../utils/fs.js'
import { findPolicyFile, loadPolicy } from '../../policy/load-policy.js'
import {
  approvePackageScripts,
  writePolicy,
  detectAllScriptsForPackage
} from '../../policy/update-policy.js'
import { parseLockfile } from '../../installer/parse-lockfile.js'
import { detectScripts } from '../../installer/detect-scripts.js'
import { logger } from '../../utils/logger.js'
import { LOCKFILE_NAMES } from '../../constants/index.js'
import { fileExists } from '../../utils/fs.js'
import type { CLIArgs, LifecycleScript } from '../../types/index.js'

function findLockfile(projectRoot: string): string {
  for (const lockfileName of LOCKFILE_NAMES) {
    const lockfilePath = resolvePath(projectRoot, lockfileName)
    if (fileExists(lockfilePath)) {
      return lockfilePath
    }
  }
  throw new Error('No lockfile found. Please run npm install first.')
}

export async function approveCommand(
  args: CLIArgs,
  projectRoot: string = process.cwd()
): Promise<void> {
  if (!args.packageName) {
    throw new Error('Package name is required for approve command')
  }

  const policyPath = args.policy
    ? resolvePath(projectRoot, args.policy)
    : findPolicyFile(projectRoot)

  logger.info(`Loading policy from ${policyPath}...`)
  const policy = loadPolicy(policyPath)

  logger.info('Detecting scripts for package...')
  const lockfilePath = findLockfile(projectRoot)
  const dependencies = parseLockfile(lockfilePath)
  const detectedScripts = detectScripts(dependencies, projectRoot)

  const scriptsToApprove = detectAllScriptsForPackage(
    args.packageName,
    detectedScripts
  )

  if (scriptsToApprove.length === 0) {
    logger.warn(
      `No lifecycle scripts found for package ${args.packageName}. It may not be installed or may not have any lifecycle scripts.`
    )
    return
  }

  logger.info(
    `Approving scripts for ${args.packageName}: ${scriptsToApprove.join(', ')}`
  )

  const updatedPolicy = approvePackageScripts(
    policy,
    args.packageName,
    scriptsToApprove as LifecycleScript[]
  )

  writePolicy(policyPath, updatedPolicy)
  logger.info(`Policy updated successfully. Approved ${scriptsToApprove.length} script(s) for ${args.packageName}`)
}

