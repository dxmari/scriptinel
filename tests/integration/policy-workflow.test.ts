import { describe, it, expect } from 'vitest'
import type { DetectedScript, Policy } from '../../src/types/index.js'
import { matchScriptsAgainstPolicy } from '../../src/policy/match-scripts.js'
import { approvePackageScripts } from '../../src/policy/update-policy.js'

/**
 * Test demonstrating how the policy system works
 * 
 * Scenarios:
 * 1. Empty policy - everything is a violation
 * 2. Partial approval - some scripts approved, others not
 * 3. Blocked scripts - explicit denials
 * 4. Policy updates - adding new approvals
 */
describe('Policy Workflow', () => {
  const mockScripts: DetectedScript[] = [
    {
      packageName: 'esbuild',
      script: 'postinstall',
      version: '0.19.0',
      path: 'node_modules/esbuild'
    },
    {
      packageName: 'sharp',
      script: 'install',
      version: '0.32.0',
      path: 'node_modules/sharp'
    },
    {
      packageName: 'left-pad',
      script: 'postinstall',
      version: '1.0.0',
      path: 'node_modules/left-pad'
    }
  ]

  it('should detect violations when policy is empty', () => {
    const policy: Policy = {
      version: 1,
      allow: {},
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const result = matchScriptsAgainstPolicy(mockScripts, policy)
    
    expect(result.violations.length).toBe(3)
    expect(result.approved.length).toBe(0)
    expect(result.violations[0]?.packageName).toBe('esbuild')
  })

  it('should approve scripts that are in the allow list', () => {
    const policy: Policy = {
      version: 1,
      allow: {
        'esbuild': ['postinstall'],
        'sharp': ['install']
      },
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const result = matchScriptsAgainstPolicy(mockScripts, policy)
    
    expect(result.approved.length).toBe(2)
    expect(result.violations.length).toBe(1)
    expect(result.violations[0]?.packageName).toBe('left-pad')
    expect(result.approved.some(s => s.packageName === 'esbuild')).toBe(true)
    expect(result.approved.some(s => s.packageName === 'sharp')).toBe(true)
  })

  it('should block scripts in the blocked list', () => {
    const policy: Policy = {
      version: 1,
      allow: {
        'esbuild': ['postinstall']
      },
      blocked: {
        'left-pad': ['postinstall']
      },
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const result = matchScriptsAgainstPolicy(mockScripts, policy)
    
    expect(result.approved.length).toBe(1)
    expect(result.blocked.length).toBe(1)
    expect(result.violations.length).toBe(1)
    expect(result.blocked[0]?.packageName).toBe('left-pad')
  })

  it('should allow updating policy to approve new packages', () => {
    let policy: Policy = {
      version: 1,
      allow: {},
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    // Initially, all scripts are violations
    let result = matchScriptsAgainstPolicy(mockScripts, policy)
    expect(result.violations.length).toBe(3)

    // Approve esbuild
    policy = approvePackageScripts(policy, 'esbuild', ['postinstall'])
    result = matchScriptsAgainstPolicy(mockScripts, policy)
    expect(result.approved.length).toBe(1)
    expect(result.violations.length).toBe(2)

    // Approve sharp
    policy = approvePackageScripts(policy, 'sharp', ['install'])
    result = matchScriptsAgainstPolicy(mockScripts, policy)
    expect(result.approved.length).toBe(2)
    expect(result.violations.length).toBe(1)

    // Final violation is left-pad
    expect(result.violations[0]?.packageName).toBe('left-pad')
  })

  it('should handle partial script approval correctly', () => {
    const scriptsWithMultiple: DetectedScript[] = [
      {
        packageName: 'package-x',
        script: 'preinstall',
        version: '1.0.0',
        path: 'node_modules/package-x'
      },
      {
        packageName: 'package-x',
        script: 'postinstall',
        version: '1.0.0',
        path: 'node_modules/package-x'
      }
    ]

    const policy: Policy = {
      version: 1,
      allow: {
        'package-x': ['postinstall'] // Only postinstall approved
      },
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const result = matchScriptsAgainstPolicy(scriptsWithMultiple, policy)
    
    expect(result.approved.length).toBe(1)
    expect(result.approved[0]?.script).toBe('postinstall')
    expect(result.violations.length).toBe(1)
    expect(result.violations[0]?.script).toBe('preinstall')
  })
})

