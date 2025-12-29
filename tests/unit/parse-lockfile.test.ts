import { describe, it, expect } from 'vitest'
import { parseLockfile } from '../../src/installer/parse-lockfile.js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('parseLockfile', () => {
  it('should parse lockfile v2 format', () => {
    const lockfile = {
      packages: {
        '': { version: '1.0.0' },
        'node_modules/package-a': { version: '1.0.0' },
        'node_modules/package-b': { version: '2.0.0' }
      }
    }

    const tempDir = join(tmpdir(), `scriptinel-test-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
    const lockfilePath = join(tempDir, 'package-lock.json')
    writeFileSync(lockfilePath, JSON.stringify(lockfile))

    const result = parseLockfile(lockfilePath)
    expect(result).toHaveLength(2)
    expect(result[0]?.name).toBe('package-a')
    expect(result[1]?.name).toBe('package-b')
  })

  it('should return empty array for empty lockfile', () => {
    const lockfile = { packages: {} }
    const tempDir = join(tmpdir(), `scriptinel-test-${Date.now()}`)
    mkdirSync(tempDir, { recursive: true })
    const lockfilePath = join(tempDir, 'package-lock.json')
    writeFileSync(lockfilePath, JSON.stringify(lockfile))

    const result = parseLockfile(lockfilePath)
    expect(result).toHaveLength(0)
  })
})

