import * as fs from "fs"

import { ParaHyangConfigSchema, type ParaHyangConfig } from "./config"
import {
  addConfigLoadError,
  log,
  migrateConfigFile,
  parseJsonc,
} from "./shared"

const PARTIAL_STRING_ARRAY_KEYS = new Set([
  "disabled_mcps",
  "disabled_agents",
  "disabled_skills",
  "disabled_hooks",
  "disabled_commands",
  "disabled_tools",
  "mcp_env_allowlist",
])

export function parseConfigPartially(rawConfig: Record<string, unknown>): ParaHyangConfig | null {
  const fullResult = ParaHyangConfigSchema.safeParse(rawConfig)
  if (fullResult.success) {
    return fullResult.data
  }

  const partialConfig: Record<string, unknown> = {}
  const invalidSections: string[] = []

  for (const key of Object.keys(rawConfig)) {
    if (PARTIAL_STRING_ARRAY_KEYS.has(key)) {
      const sectionValue = rawConfig[key]
      if (Array.isArray(sectionValue) && sectionValue.every((value) => typeof value === "string")) {
        partialConfig[key] = sectionValue
      }
      continue
    }

    const sectionResult = ParaHyangConfigSchema.safeParse({ [key]: rawConfig[key] })
    if (sectionResult.success) {
      const parsed = sectionResult.data as Record<string, unknown>
      if (parsed[key] !== undefined) {
        partialConfig[key] = parsed[key]
      }
      continue
    }

    const sectionErrors = sectionResult.error.issues
      .filter((issue) => issue.path[0] === key)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")
    if (sectionErrors) {
      invalidSections.push(`${key}: ${sectionErrors}`)
    }
  }

  if (invalidSections.length > 0) {
    log("Partial config loaded - invalid sections skipped:", invalidSections)
  }

  return partialConfig as ParaHyangConfig
}

export function loadConfigFromPath(configPath: string, _ctx: unknown): ParaHyangConfig | null {
  try {
    if (!fs.existsSync(configPath)) {
      return null
    }

    const content = fs.readFileSync(configPath, "utf-8")
    const rawConfig = parseJsonc<Record<string, unknown>>(content)

    migrateConfigFile(configPath, rawConfig)

    const result = ParaHyangConfigSchema.safeParse(rawConfig)
    if (result.success) {
      log(`Config loaded from ${configPath}`, { agents: result.data.agents })
      return result.data
    }

    const errorMsg = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")
    log(`Config validation error in ${configPath}:`, result.error.issues)
    addConfigLoadError({
      path: configPath,
      error: `Partial config loaded - invalid sections skipped: ${errorMsg}`,
    })

    const partialResult = parseConfigPartially(rawConfig)
    if (partialResult) {
      log(`Partial config loaded from ${configPath}`, { agents: partialResult.agents })
      return partialResult
    }

    return null
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    log(`Error loading config from ${configPath}:`, err)
    addConfigLoadError({ path: configPath, error: errorMsg })
    return null
  }
}
