export const EXIT_CODES = {
  SUCCESS: 0,
  POLICY_VIOLATION: 1,
  INTERNAL_FAILURE: 2
} as const

export const POLICY_FILE_NAME = 'install-scripts.policy.json'

export const LOCKFILE_NAMES = [
  'package-lock.json',
  'npm-shrinkwrap.json'
] as const

import type { LifecycleScript } from '../types/index.js'

export const LIFECYCLE_SCRIPTS: readonly LifecycleScript[] = [
  'preinstall',
  'install',
  'postinstall'
] as const

export const POLICY_VERSION = 1

export const NODE_MODULES_DIR = 'node_modules'

export const PACKAGE_JSON = 'package.json'

