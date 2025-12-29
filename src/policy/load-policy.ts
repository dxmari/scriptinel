import { readJsonFile, fileExists, resolvePath } from '../utils/fs.js'
import { POLICY_FILE_NAME, POLICY_VERSION } from '../constants/index.js'
import { InternalError } from '../errors/internal-error.js'
import type { Policy } from '../types/index.js'

export function findPolicyFile(projectRoot: string): string {
  return resolvePath(projectRoot, POLICY_FILE_NAME)
}

export function loadPolicy(policyPath: string): Policy {
  if (!fileExists(policyPath)) {
    return createDefaultPolicy()
  }

  const policy = readJsonFile<Policy>(policyPath)
  validatePolicyStructure(policy)
  return policy
}

function validatePolicyStructure(policy: unknown): asserts policy is Policy {
  if (typeof policy !== 'object' || policy === null) {
    throw new InternalError('Policy file must be a JSON object')
  }

  const p = policy as Record<string, unknown>

  if (typeof p.version !== 'number') {
    throw new InternalError('Policy must have a numeric version field')
  }

  if (p.version !== POLICY_VERSION) {
    throw new InternalError(
      `Policy version ${p.version} is not supported. Expected version ${POLICY_VERSION}`
    )
  }

  if (typeof p.allow !== 'object' || p.allow === null) {
    throw new InternalError('Policy must have an allow field')
  }

  if (typeof p.metadata !== 'object' || p.metadata === null) {
    throw new InternalError('Policy must have a metadata field')
  }

  const metadata = p.metadata as Record<string, unknown>
  if (typeof metadata.generatedAt !== 'string') {
    throw new InternalError('Policy metadata must have a generatedAt field')
  }

  if (typeof metadata.approvedBy !== 'string') {
    throw new InternalError('Policy metadata must have an approvedBy field')
  }
}

function createDefaultPolicy(): Policy {
  return {
    version: POLICY_VERSION,
    allow: {},
    metadata: {
      generatedAt: new Date().toISOString().split('T')[0] ?? '',
      approvedBy: 'system'
    }
  }
}

