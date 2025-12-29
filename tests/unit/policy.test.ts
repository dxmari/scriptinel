import { describe, it, expect } from 'vitest'
import { matchScriptsAgainstPolicy } from '../../src/policy/match-scripts.js'
import type { DetectedScript, Policy } from '../../src/types/index.js'

describe('matchScriptsAgainstPolicy', () => {
  it('should approve scripts that are in policy', () => {
    const policy: Policy = {
      version: 1,
      allow: {
        'package-a': ['postinstall']
      },
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const detected: DetectedScript[] = [
      {
        packageName: 'package-a',
        script: 'postinstall',
        version: '1.0.0',
        path: 'node_modules/package-a'
      }
    ]

    const result = matchScriptsAgainstPolicy(detected, policy)
    expect(result.approved).toHaveLength(1)
    expect(result.violations).toHaveLength(0)
  })

  it('should flag unapproved scripts as violations', () => {
    const policy: Policy = {
      version: 1,
      allow: {},
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const detected: DetectedScript[] = [
      {
        packageName: 'package-a',
        script: 'postinstall',
        version: '1.0.0',
        path: 'node_modules/package-a'
      }
    ]

    const result = matchScriptsAgainstPolicy(detected, policy)
    expect(result.approved).toHaveLength(0)
    expect(result.violations).toHaveLength(1)
  })

  it('should block scripts in blocked list', () => {
    const policy: Policy = {
      version: 1,
      allow: {
        'package-a': ['postinstall']
      },
      blocked: {
        'package-a': ['preinstall']
      },
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const detected: DetectedScript[] = [
      {
        packageName: 'package-a',
        script: 'preinstall',
        version: '1.0.0',
        path: 'node_modules/package-a'
      }
    ]

    const result = matchScriptsAgainstPolicy(detected, policy)
    expect(result.blocked).toHaveLength(1)
    expect(result.approved).toHaveLength(0)
  })
})

