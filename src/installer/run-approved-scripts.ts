import { spawn } from 'child_process'
import { joinPath } from '../utils/fs.js'
import { InternalError } from '../errors/internal-error.js'
import { logger } from '../utils/logger.js'
import type { DetectedScript } from '../types/index.js'

function validatePackageName(name: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) {
    throw new InternalError(`Invalid package name: ${name}`)
  }
}

function executeScript(
  script: DetectedScript,
  projectRoot: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    validatePackageName(script.packageName)

    const packagePath = joinPath(projectRoot, script.path)
    const scriptCommand = script.script

    const npmProcess = spawn(
      'npm',
      ['run', scriptCommand, '--prefix', packagePath],
      {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: false
      }
    )

    npmProcess.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(
          new InternalError(
            `Script ${scriptCommand} failed for package ${script.packageName}`,
            {
              packageName: script.packageName,
              script: scriptCommand,
              exitCode: code
            }
          )
        )
      }
    })

    npmProcess.on('error', error => {
      reject(
        new InternalError(
          `Failed to execute script ${scriptCommand} for package ${script.packageName}`,
          {
            packageName: script.packageName,
            script: scriptCommand,
            error: error.message
          }
        )
      )
    })
  })
}

export async function runApprovedScripts(
  scripts: DetectedScript[],
  projectRoot: string
): Promise<void> {
  logger.info(`Executing ${scripts.length} approved script(s)...`)

  for (const script of scripts) {
    logger.info(
      `Running ${script.script} for ${script.packageName}@${script.version}`
    )
    await executeScript(script, projectRoot)
  }

  logger.info('All approved scripts executed successfully')
}

