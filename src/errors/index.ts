export abstract class ScriptinelError extends Error {
  abstract readonly exitCode: number
  abstract readonly code: string

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

