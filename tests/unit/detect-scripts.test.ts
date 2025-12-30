import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { detectScripts } from '../../src/installer/detect-scripts.js'
import type { DependencyInfo } from '../../src/installer/parse-lockfile.js'

describe('detectScripts', () => {
  let testDir: string

  beforeEach(() => {
    testDir = join(tmpdir(), `scriptinel-detect-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should detect postinstall script', () => {
    const nodeModulesDir = join(testDir, 'node_modules', 'test-package')
    mkdirSync(nodeModulesDir, { recursive: true })

    writeFileSync(
      join(nodeModulesDir, 'package.json'),
      JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          postinstall: 'echo "installed"'
        }
      })
    )

    const dependencies: DependencyInfo[] = [
      {
        name: 'test-package',
        version: '1.0.0',
        path: 'node_modules/test-package'
      }
    ]

    const scripts = detectScripts(dependencies, testDir)

    expect(scripts.length).toBe(1)
    expect(scripts[0]?.packageName).toBe('test-package')
    expect(scripts[0]?.script).toBe('postinstall')
  })

  it('should detect multiple scripts from same package', () => {
    const nodeModulesDir = join(testDir, 'node_modules', 'multi-script')
    mkdirSync(nodeModulesDir, { recursive: true })

    writeFileSync(
      join(nodeModulesDir, 'package.json'),
      JSON.stringify({
        name: 'multi-script',
        version: '1.0.0',
        scripts: {
          preinstall: 'echo "pre"',
          postinstall: 'echo "post"'
        }
      })
    )

    const dependencies: DependencyInfo[] = [
      {
        name: 'multi-script',
        version: '1.0.0',
        path: 'node_modules/multi-script'
      }
    ]

    const scripts = detectScripts(dependencies, testDir)

    expect(scripts.length).toBe(2)
    expect(scripts.some(s => s.script === 'preinstall')).toBe(true)
    expect(scripts.some(s => s.script === 'postinstall')).toBe(true)
  })

  it('should ignore non-lifecycle scripts', () => {
    const nodeModulesDir = join(testDir, 'node_modules', 'other-scripts')
    mkdirSync(nodeModulesDir, { recursive: true })

    writeFileSync(
      join(nodeModulesDir, 'package.json'),
      JSON.stringify({
        name: 'other-scripts',
        version: '1.0.0',
        scripts: {
          test: 'jest',
          build: 'tsc',
          start: 'node index.js'
        }
      })
    )

    const dependencies: DependencyInfo[] = [
      {
        name: 'other-scripts',
        version: '1.0.0',
        path: 'node_modules/other-scripts'
      }
    ]

    const scripts = detectScripts(dependencies, testDir)

    expect(scripts.length).toBe(0)
  })

  it('should handle packages without scripts', () => {
    const nodeModulesDir = join(testDir, 'node_modules', 'no-scripts')
    mkdirSync(nodeModulesDir, { recursive: true })

    writeFileSync(
      join(nodeModulesDir, 'package.json'),
      JSON.stringify({
        name: 'no-scripts',
        version: '1.0.0'
      })
    )

    const dependencies: DependencyInfo[] = [
      {
        name: 'no-scripts',
        version: '1.0.0',
        path: 'node_modules/no-scripts'
      }
    ]

    const scripts = detectScripts(dependencies, testDir)

    expect(scripts.length).toBe(0)
  })

  it('should return scripts in sorted order', () => {
    const pkg1Dir = join(testDir, 'node_modules', 'package-a')
    const pkg2Dir = join(testDir, 'node_modules', 'package-b')
    mkdirSync(pkg1Dir, { recursive: true })
    mkdirSync(pkg2Dir, { recursive: true })

    writeFileSync(
      join(pkg1Dir, 'package.json'),
      JSON.stringify({
        name: 'package-a',
        version: '1.0.0',
        scripts: { postinstall: 'echo a' }
      })
    )

    writeFileSync(
      join(pkg2Dir, 'package.json'),
      JSON.stringify({
        name: 'package-b',
        version: '1.0.0',
        scripts: { postinstall: 'echo b' }
      })
    )

    const dependencies: DependencyInfo[] = [
      {
        name: 'package-b',
        version: '1.0.0',
        path: 'node_modules/package-b'
      },
      {
        name: 'package-a',
        version: '1.0.0',
        path: 'node_modules/package-a'
      }
    ]

    const scripts = detectScripts(dependencies, testDir)

    expect(scripts.length).toBe(2)
    expect(scripts[0]?.packageName).toBe('package-a')
    expect(scripts[1]?.packageName).toBe('package-b')
  })
})

