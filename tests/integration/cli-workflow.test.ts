import { describe, it, expect } from 'vitest'
import { parseArgs } from '../../src/cli/parse-args.js'

/**
 * Test demonstrating CLI usage patterns
 * 
 * Shows how different command-line arguments are parsed
 * and what they mean in practice
 */
describe('CLI Workflow', () => {
  it('should parse default run command', () => {
    const args = parseArgs([])
    
    expect(args.command).toBe('run')
    expect(args.ci).toBe(false)
    expect(args.audit).toBe(false)
    expect(args.json).toBe(false)
    
    // Default mode: warn on violations, don't fail
    // This is for local development
  })

  it('should parse CI mode', () => {
    const args = parseArgs(['--ci'])
    
    expect(args.command).toBe('run')
    expect(args.ci).toBe(true)
    
    // CI mode: fail on violations (exit code 1)
    // Use this in GitHub Actions, GitLab CI, etc.
  })

  it('should parse audit mode', () => {
    const args = parseArgs(['--audit'])
    
    expect(args.command).toBe('run')
    expect(args.audit).toBe(true)
    
    // Audit mode: report only, don't block or execute scripts
    // Useful for security audits without changing behavior
  })

  it('should parse approve command', () => {
    const args = parseArgs(['approve', 'esbuild'])
    
    expect(args.command).toBe('approve')
    expect(args.packageName).toBe('esbuild')
    
    // Approve command: adds package scripts to policy
    // Usage: npx scriptinel approve <package-name>
  })

  it('should parse JSON output flag', () => {
    const args = parseArgs(['--json'])
    
    expect(args.json).toBe(true)
    
    // JSON mode: machine-readable output
    // Useful for automation and CI integration
  })

  it('should parse custom policy path', () => {
    const args = parseArgs(['--policy', 'custom-policy.json'])
    
    expect(args.policy).toBe('custom-policy.json')
    
    // Custom policy: use a different policy file
    // Useful for monorepos or special configurations
  })

  it('should combine multiple flags', () => {
    const args = parseArgs(['--ci', '--json'])
    
    expect(args.ci).toBe(true)
    expect(args.json).toBe(true)
    
    // Combined: CI mode with JSON output
    // Perfect for CI pipelines that need structured output
  })
})

