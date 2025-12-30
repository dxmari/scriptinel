import { writeFileSync } from 'fs'
import { InternalError } from '../errors/internal-error.js'
import { validatePolicy } from './validate-policy.js'
import { LIFECYCLE_SCRIPTS } from '../constants/index.js'
import type { Policy, LifecycleScript } from '../types/index.js'

function sortByLifecycleOrder(scripts: LifecycleScript[]): LifecycleScript[] {
  return scripts.sort((a, b) => {
    const indexA = LIFECYCLE_SCRIPTS.indexOf(a)
    const indexB = LIFECYCLE_SCRIPTS.indexOf(b)
    return indexA - indexB
  })
}

export function approvePackageScripts(
  policy: Policy,
  packageName: string,
  scripts: LifecycleScript[]
): Policy {
  const currentAllowed = policy.allow[packageName] ?? []
  const newAllowed = sortByLifecycleOrder([...new Set([...currentAllowed, ...scripts])])

  const updatedPolicy: Policy = {
    ...policy,
    allow: {
      ...policy.allow,
      [packageName]: newAllowed
    },
    metadata: {
      ...policy.metadata,
      generatedAt: new Date().toISOString().split('T')[0] ?? ''
    }
  }

  validatePolicy(updatedPolicy)
  return updatedPolicy
}

export function writePolicy(policyPath: string, policy: Policy): void {
  try {
    const content = JSON.stringify(policy, null, 2) + '\n'
    writeFileSync(policyPath, content, 'utf-8')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new InternalError(`Failed to write policy file: ${policyPath}`, {
      policyPath,
      error: message
    })
  }
}

export function detectAllScriptsForPackage(
  packageName: string,
  detectedScripts: Array<{ packageName: string; script: LifecycleScript }>
): LifecycleScript[] {
  const scripts = detectedScripts
    .filter(s => s.packageName === packageName)
    .map(s => s.script)

  return sortByLifecycleOrder([...new Set(scripts)])
}

