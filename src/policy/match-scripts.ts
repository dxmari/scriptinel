import type {
  DetectedScript,
  Policy,
  PolicyViolation,
  ScriptMatchResult
} from '../types/index.js'

export function matchScriptsAgainstPolicy(
  detectedScripts: DetectedScript[],
  policy: Policy
): ScriptMatchResult {
  const approved: DetectedScript[] = []
  const violations: PolicyViolation[] = []
  const blocked: DetectedScript[] = []

  for (const script of detectedScripts) {
    const isBlocked = isScriptBlocked(script, policy)
    if (isBlocked) {
      blocked.push(script)
      continue
    }

    const isApproved = isScriptApproved(script, policy)
    if (isApproved) {
      approved.push(script)
    } else {
      violations.push({
        packageName: script.packageName,
        script: script.script,
        version: script.version
      })
    }
  }

  return {
    approved: approved.sort((a, b) => {
      const nameCompare = a.packageName.localeCompare(b.packageName)
      if (nameCompare !== 0) {
        return nameCompare
      }
      return a.script.localeCompare(b.script)
    }),
    violations: violations.sort((a, b) => {
      const nameCompare = a.packageName.localeCompare(b.packageName)
      if (nameCompare !== 0) {
        return nameCompare
      }
      return a.script.localeCompare(b.script)
    }),
    blocked: blocked.sort((a, b) => {
      const nameCompare = a.packageName.localeCompare(b.packageName)
      if (nameCompare !== 0) {
        return nameCompare
      }
      return a.script.localeCompare(b.script)
    })
  }
}

function isScriptApproved(script: DetectedScript, policy: Policy): boolean {
  const allowedScripts = policy.allow[script.packageName]
  if (!allowedScripts) {
    return false
  }

  return allowedScripts.includes(script.script)
}

function isScriptBlocked(script: DetectedScript, policy: Policy): boolean {
  if (!policy.blocked) {
    return false
  }

  const blockedScripts = policy.blocked[script.packageName]
  if (!blockedScripts) {
    return false
  }

  return blockedScripts.includes(script.script)
}

