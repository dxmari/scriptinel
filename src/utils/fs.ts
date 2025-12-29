import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { InternalError } from '../errors/internal-error.js'

export function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new InternalError(`Failed to read file: ${filePath}`, {
      filePath,
      error: message
    })
  }
}

export function readJsonFile<T>(filePath: string): T {
  try {
    const content = readFile(filePath)
    return JSON.parse(content) as T
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new InternalError(`Failed to parse JSON file: ${filePath}`, {
      filePath,
      error: message
    })
  }
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath)
}

export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export function resolvePath(...segments: string[]): string {
  return resolve(...segments)
}

export function joinPath(...segments: string[]): string {
  return join(...segments)
}

export function readDirectory(dirPath: string): string[] {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new InternalError(`Failed to read directory: ${dirPath}`, {
      dirPath,
      error: message
    })
  }
}

