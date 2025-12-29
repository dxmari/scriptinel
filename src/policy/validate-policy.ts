import type { Policy, LifecycleScript } from '../types/index.js'
import { LIFECYCLE_SCRIPTS } from '../constants/index.js'

export function validatePolicy(policy: Policy): void {
  for (const [packageName, scripts] of Object.entries(policy.allow)) {
    if (!isValidPackageName(packageName)) {
      throw new Error(`Invalid package name in policy: ${packageName}`)
    }

    if (!Array.isArray(scripts)) {
      throw new Error(`Scripts for ${packageName} must be an array`)
    }

    for (const script of scripts) {
      if (!isValidLifecycleScript(script)) {
        throw new Error(
          `Invalid lifecycle script "${script}" for package ${packageName}`
        )
      }
    }
  }

  if (policy.blocked) {
    for (const [packageName, scripts] of Object.entries(policy.blocked)) {
      if (!isValidPackageName(packageName)) {
        throw new Error(`Invalid package name in blocked list: ${packageName}`)
      }

      if (!Array.isArray(scripts)) {
        throw new Error(`Blocked scripts for ${packageName} must be an array`)
      }

      for (const script of scripts) {
        if (!isValidLifecycleScript(script)) {
          throw new Error(
            `Invalid lifecycle script "${script}" in blocked list for ${packageName}`
          )
        }
      }
    }
  }
}

function isValidPackageName(name: string): boolean {
  if (name.length === 0 || name.length > 214) {
    return false
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return false
  }

  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)
}

function isValidLifecycleScript(script: string): script is LifecycleScript {
  return LIFECYCLE_SCRIPTS.includes(script as LifecycleScript)
}

