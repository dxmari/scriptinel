import { spawn } from 'child_process'
import { InternalError } from '../errors/internal-error.js'

export function runNpmInstall(
  projectRoot: string,
  ignoreScripts: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ['install']
    if (ignoreScripts) {
      args.push('--ignore-scripts')
    }

    const npmProcess = spawn('npm', args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false
    })

    npmProcess.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(
          new InternalError(`npm install failed with exit code ${code}`, {
            exitCode: code
          })
        )
      }
    })

    npmProcess.on('error', error => {
      reject(
        new InternalError(`Failed to spawn npm install process`, {
          error: error.message
        })
      )
    })
  })
}

