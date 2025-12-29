export type LifecycleScript = 'preinstall' | 'install' | 'postinstall'

export interface DetectedScript {
  packageName: string
  script: LifecycleScript
  version: string
  path: string
}

export interface PolicyMetadata {
  generatedAt: string
  approvedBy: string
}

export interface Policy {
  version: number
  allow: Record<string, LifecycleScript[]>
  blocked?: Record<string, LifecycleScript[]>
  metadata: PolicyMetadata
}

export interface PolicyViolation {
  packageName: string
  script: LifecycleScript
  version: string
}

export interface ScriptMatchResult {
  approved: DetectedScript[]
  violations: PolicyViolation[]
  blocked: DetectedScript[]
}

export interface InstallContext {
  policyPath: string
  projectRoot: string
  lockfilePath: string
  nodeModulesPath: string
}

export interface CLIArgs {
  command?: 'run' | 'approve'
  packageName?: string
  ci: boolean
  audit: boolean
  json: boolean
  policy?: string
}

export interface ReporterOutput {
  violations: PolicyViolation[]
  approved: DetectedScript[]
  blocked: DetectedScript[]
  summary: {
    totalDetected: number
    totalApproved: number
    totalViolations: number
    totalBlocked: number
  }
}

