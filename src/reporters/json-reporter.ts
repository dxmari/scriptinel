import type { ReporterOutput } from '../types/index.js'

export function reportToJson(output: ReporterOutput): string {
  return JSON.stringify(output, null, 2)
}

