import type { PolicyViolation } from '../types/index.js'

export function formatViolations(violations: PolicyViolation[]): string[] {
  if (violations.length === 0) {
    return []
  }

  const messages: string[] = []
  messages.push(`\nFound ${violations.length} unapproved script(s):\n`)

  for (const violation of violations) {
    messages.push(
      `  • ${violation.packageName}@${violation.version} - ${violation.script}`
    )
  }

  messages.push('\nTo approve these scripts, run:')
  const uniquePackages = [...new Set(violations.map(v => v.packageName))]

  for (const packageName of uniquePackages) {
    messages.push(`  npx scriptinel approve ${packageName}`)
  }

  return messages
}

