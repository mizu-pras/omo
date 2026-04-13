import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse, ParseError, printParseErrorCode } from "jsonc-parser"

import { CONFIG_BASENAME, LEGACY_CONFIG_BASENAME, SECONDARY_LEGACY_CONFIG_BASENAME } from "./plugin-identity"

export interface JsoncParseResult<T> {
  data: T | null
  errors: Array<{ message: string; offset: number; length: number }>
}

function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
}

export function parseJsonc<T = unknown>(content: string): T {
  // Strip UTF-8 BOM if present (Windows UTF-8 with BOM files)
  content = content.replace(/^\uFEFF/, "")

  const errors: ParseError[] = []
  const result = parse(stripBom(content), errors, {
    allowTrailingComma: true,
    disallowComments: false,
  }) as T

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${printParseErrorCode(e.error)} at offset ${e.offset}`)
      .join(", ")
    throw new SyntaxError(`JSONC parse error: ${errorMessages}`)
  }

  return result
}

export function parseJsoncSafe<T = unknown>(content: string): JsoncParseResult<T> {
  const errors: ParseError[] = []
  const data = parse(stripBom(content), errors, {
    allowTrailingComma: true,
    disallowComments: false,
  }) as T | null

  return {
    data: errors.length > 0 ? null : data,
    errors: errors.map((e) => ({
      message: printParseErrorCode(e.error),
      offset: e.offset,
      length: e.length,
    })),
  }
}

export function readJsoncFile<T = unknown>(filePath: string): T | null {
  try {
    const content = readFileSync(filePath, "utf-8")
    return parseJsonc<T>(content)
  } catch {
    return null
  }
}

export function detectConfigFile(basePath: string): {
  format: "json" | "jsonc" | "none"
  path: string
} {
  const jsoncPath = `${basePath}.jsonc`
  const jsonPath = `${basePath}.json`

  if (existsSync(jsoncPath)) {
    return { format: "jsonc", path: jsoncPath }
  }
  if (existsSync(jsonPath)) {
    return { format: "json", path: jsonPath }
  }
  return { format: "none", path: jsonPath }
}

export function detectPluginConfigFile(dir: string): {
  format: "json" | "jsonc" | "none"
  path: string
  legacyPaths: string[]
  legacyPath?: string
} {
  const canonicalResult = detectConfigFile(join(dir, CONFIG_BASENAME))
  const legacyResult = detectConfigFile(join(dir, LEGACY_CONFIG_BASENAME))
  const secondaryLegacyResult = detectConfigFile(join(dir, SECONDARY_LEGACY_CONFIG_BASENAME))

  const legacyPaths = [legacyResult, secondaryLegacyResult]
    .filter((result) => result.format !== "none")
    .map((result) => result.path)

  if (canonicalResult.format !== "none") {
    return {
      ...canonicalResult,
      legacyPaths,
      legacyPath: legacyPaths[0],
    }
  }

  if (legacyResult.format !== "none") {
    const remainingLegacyPaths = secondaryLegacyResult.format !== "none"
      ? [secondaryLegacyResult.path]
      : []

    return {
      ...legacyResult,
      legacyPaths: remainingLegacyPaths,
      legacyPath: remainingLegacyPaths[0],
    }
  }

  if (secondaryLegacyResult.format !== "none") {
    return {
      ...secondaryLegacyResult,
      legacyPaths: [],
    }
  }

  return {
    format: "none",
    path: join(dir, `${CONFIG_BASENAME}.json`),
    legacyPaths: [],
  }
}
