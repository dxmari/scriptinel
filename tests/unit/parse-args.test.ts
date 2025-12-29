import { describe, it, expect } from 'vitest'
import { parseArgs } from '../../src/cli/parse-args.js'

describe('parseArgs', () => {
  it('should parse default run command', () => {
    const args = parseArgs([])
    expect(args.command).toBe('run')
    expect(args.ci).toBe(false)
    expect(args.audit).toBe(false)
  })

  it('should parse --ci flag', () => {
    const args = parseArgs(['--ci'])
    expect(args.ci).toBe(true)
  })

  it('should parse --audit flag', () => {
    const args = parseArgs(['--audit'])
    expect(args.audit).toBe(true)
  })

  it('should parse --json flag', () => {
    const args = parseArgs(['--json'])
    expect(args.json).toBe(true)
  })

  it('should parse approve command with package name', () => {
    const args = parseArgs(['approve', 'esbuild'])
    expect(args.command).toBe('approve')
    expect(args.packageName).toBe('esbuild')
  })

  it('should parse --policy flag', () => {
    const args = parseArgs(['--policy', 'custom-policy.json'])
    expect(args.policy).toBe('custom-policy.json')
  })

  it('should throw error for missing package name in approve', () => {
    expect(() => parseArgs(['approve'])).toThrow('Missing package name')
  })

  it('should throw error for unknown flag', () => {
    expect(() => parseArgs(['--unknown'])).toThrow('Unknown flag')
  })
})

