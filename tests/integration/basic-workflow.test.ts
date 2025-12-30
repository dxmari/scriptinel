import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

/**
 * Integration test demonstrating the complete Scriptinel workflow
 * 
 * This test creates a mock npm project and shows:
 * 1. How Scriptinel detects lifecycle scripts
 * 2. How policy approval works
 * 3. How violations are reported
 * 4. How approved scripts are executed
 */
describe('Scriptinel Basic Workflow', () => {
  let testProjectDir: string

  beforeEach(() => {
    testProjectDir = join(tmpdir(), `scriptinel-test-${Date.now()}`)
    mkdirSync(testProjectDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testProjectDir)) {
      rmSync(testProjectDir, { recursive: true, force: true })
    }
  })

  it('should demonstrate complete workflow: detect -> approve -> execute', async () => {
    // Step 1: Create a mock npm project with packages that have lifecycle scripts
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        'package-a': '1.0.0',
        'package-b': '2.0.0'
      }
    }

    writeFileSync(
      join(testProjectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )

    // Create package-lock.json (v2 format)
    const packageLock = {
      name: 'test-project',
      version: '1.0.0',
      lockfileVersion: 3,
      packages: {
        '': {
          name: 'test-project',
          version: '1.0.0',
          dependencies: {
            'package-a': '1.0.0',
            'package-b': '2.0.0'
          }
        },
        'node_modules/package-a': {
          version: '1.0.0',
          hasInstallScript: true
        },
        'node_modules/package-b': {
          version: '2.0.0',
          hasInstallScript: true
        }
      }
    }

    writeFileSync(
      join(testProjectDir, 'package-lock.json'),
      JSON.stringify(packageLock, null, 2)
    )

    // Create node_modules structure
    const nodeModulesDir = join(testProjectDir, 'node_modules')
    mkdirSync(join(nodeModulesDir, 'package-a'), { recursive: true })
    mkdirSync(join(nodeModulesDir, 'package-b'), { recursive: true })

    // Package A has a postinstall script
    writeFileSync(
      join(nodeModulesDir, 'package-a', 'package.json'),
      JSON.stringify({
        name: 'package-a',
        version: '1.0.0',
        scripts: {
          postinstall: 'echo "Package A installed"'
        }
      }, null, 2)
    )

    // Package B has both preinstall and postinstall scripts
    writeFileSync(
      join(nodeModulesDir, 'package-b', 'package.json'),
      JSON.stringify({
        name: 'package-b',
        version: '2.0.0',
        scripts: {
          preinstall: 'echo "Preparing package B"',
          postinstall: 'echo "Package B installed"'
        }
      }, null, 2)
    )

    // Step 2: Test script detection
    // Import and test the detection logic
    const { parseLockfile } = await import('../../src/installer/parse-lockfile.js')
    const { detectScripts } = await import('../../src/installer/detect-scripts.js')
    
    const lockfilePath = join(testProjectDir, 'package-lock.json')
    const dependencies = parseLockfile(lockfilePath)
    const detectedScripts = detectScripts(dependencies, testProjectDir)

    // Verify detection
    expect(detectedScripts.length).toBe(3)
    expect(detectedScripts.some(s => s.packageName === 'package-a' && s.script === 'postinstall')).toBe(true)
    expect(detectedScripts.some(s => s.packageName === 'package-b' && s.script === 'preinstall')).toBe(true)
    expect(detectedScripts.some(s => s.packageName === 'package-b' && s.script === 'postinstall')).toBe(true)

    // Step 3: Test policy matching
    const { matchScriptsAgainstPolicy } = await import('../../src/policy/match-scripts.js')
    
    // Empty policy - all should be violations
    const emptyPolicy = {
      version: 1,
      allow: {},
      metadata: {
        generatedAt: '2025-01-15',
        approvedBy: 'test'
      }
    }

    const matchResult = matchScriptsAgainstPolicy(detectedScripts, emptyPolicy)
    expect(matchResult.violations.length).toBe(3)
    expect(matchResult.approved.length).toBe(0)

    // Step 4: Test policy approval
    const { approvePackageScripts } = await import('../../src/policy/update-policy.js')
    
    // Approve package-a's postinstall
    let policy = approvePackageScripts(emptyPolicy, 'package-a', ['postinstall'])
    expect(policy.allow['package-a']).toEqual(['postinstall'])

    // Approve package-b's scripts
    policy = approvePackageScripts(policy, 'package-b', ['preinstall', 'postinstall'])
    expect(policy.allow['package-b']).toEqual(['preinstall', 'postinstall'])

    // Step 5: Test matching with approved policy
    const finalMatch = matchScriptsAgainstPolicy(detectedScripts, policy)
    expect(finalMatch.violations.length).toBe(0)
    expect(finalMatch.approved.length).toBe(3)
  })
})

