import { env } from 'process'

const CI_MODE = Boolean(env.CI || env.GITHUB_ACTIONS)

export interface Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

class ConsoleLogger implements Logger {
  private readonly isCI: boolean

  constructor(isCI: boolean = CI_MODE) {
    this.isCI = isCI
  }

  info(message: string): void {
    if (this.isCI) {
      console.log(message)
    } else {
      console.log(`ℹ ${message}`)
    }
  }

  warn(message: string): void {
    if (this.isCI) {
      console.warn(`WARNING: ${message}`)
    } else {
      console.warn(`⚠ ${message}`)
    }
  }

  error(message: string): void {
    if (this.isCI) {
      console.error(`ERROR: ${message}`)
    } else {
      console.error(`✗ ${message}`)
    }
  }
}

export function createLogger(isCI: boolean = CI_MODE): Logger {
  return new ConsoleLogger(isCI)
}

export const logger = createLogger()

