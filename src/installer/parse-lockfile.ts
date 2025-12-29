import { readJsonFile } from '../utils/fs.js'

interface LockfilePackage {
  version: string
  dependencies?: Record<string, LockfilePackage>
}

interface Lockfile {
  packages?: Record<string, LockfilePackage>
  dependencies?: Record<string, LockfilePackage>
}

export interface DependencyInfo {
  name: string
  version: string
  path: string
}

function extractPackageNameFromPath(path: string): string {
  if (path === '') {
    return ''
  }
  const parts = path.split('node_modules/')
  const lastPart = parts[parts.length - 1] ?? ''
  const segments = lastPart.split('/')
  return segments[0] ?? ''
}

function extractDependenciesFromLockfileV2(
  lockfile: Lockfile
): DependencyInfo[] {
  const dependencies: DependencyInfo[] = []

  if (!lockfile.packages) {
    return dependencies
  }

  for (const [path, pkg] of Object.entries(lockfile.packages)) {
    if (path === '' || !pkg.version) {
      continue
    }

    const packageName = extractPackageNameFromPath(path)
    if (packageName) {
      dependencies.push({
        name: packageName,
        version: pkg.version,
        path: path.startsWith('node_modules/') ? path : `node_modules/${path}`
      })
    }
  }

  return dependencies.sort((a, b) => a.name.localeCompare(b.name))
}

function extractDependenciesFromLockfileV1(
  lockfile: Lockfile
): DependencyInfo[] {
  const dependencies: DependencyInfo[] = []

  function traverse(
    deps: Record<string, LockfilePackage> | undefined,
    currentPath: string
  ): void {
    if (!deps) {
      return
    }

    for (const [name, pkg] of Object.entries(deps)) {
      if (!pkg.version) {
        continue
      }

      const fullPath = currentPath
        ? `${currentPath}/node_modules/${name}`
        : `node_modules/${name}`

      dependencies.push({
        name,
        version: pkg.version,
        path: fullPath
      })

      if (pkg.dependencies) {
        traverse(pkg.dependencies, fullPath)
      }
    }
  }

  if (lockfile.dependencies) {
    traverse(lockfile.dependencies, '')
  }

  return dependencies.sort((a, b) => a.name.localeCompare(b.name))
}

export function parseLockfile(lockfilePath: string): DependencyInfo[] {
  const lockfile = readJsonFile<Lockfile>(lockfilePath)

  if (lockfile.packages !== undefined) {
    return extractDependenciesFromLockfileV2(lockfile)
  }

  if (lockfile.dependencies !== undefined) {
    return extractDependenciesFromLockfileV1(lockfile)
  }

  return []
}

