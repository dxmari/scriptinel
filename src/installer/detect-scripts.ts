import { readJsonFile, fileExists, joinPath } from '../utils/fs.js'
import { LIFECYCLE_SCRIPTS, PACKAGE_JSON } from '../constants/index.js'
import type { DetectedScript, LifecycleScript } from '../types/index.js'
import type { DependencyInfo } from './parse-lockfile.js'

interface PackageJson {
  scripts?: Record<string, string>
}

function hasLifecycleScript(
  packageJson: PackageJson,
  script: LifecycleScript
): boolean {
  return Boolean(packageJson.scripts?.[script])
}

function detectScriptsInPackage(
  dependency: DependencyInfo,
  projectRoot: string
): DetectedScript[] {
  const packageJsonPath = joinPath(
    projectRoot,
    dependency.path,
    PACKAGE_JSON
  )

  if (!fileExists(packageJsonPath)) {
    return []
  }

  const packageJson = readJsonFile<PackageJson>(packageJsonPath)
  const detected: DetectedScript[] = []

  for (const script of LIFECYCLE_SCRIPTS) {
    if (hasLifecycleScript(packageJson, script)) {
      detected.push({
        packageName: dependency.name,
        script,
        version: dependency.version,
        path: dependency.path
      })
    }
  }

  return detected
}

export function detectScripts(
  dependencies: DependencyInfo[],
  projectRoot: string
): DetectedScript[] {
  const allScripts: DetectedScript[] = []

  for (const dependency of dependencies) {
    const scripts = detectScriptsInPackage(dependency, projectRoot)
    allScripts.push(...scripts)
  }

  return allScripts.sort((a, b) => {
    const nameCompare = a.packageName.localeCompare(b.packageName)
    if (nameCompare !== 0) {
      return nameCompare
    }
    return a.script.localeCompare(b.script)
  })
}

