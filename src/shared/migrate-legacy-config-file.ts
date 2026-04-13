import { existsSync, readFileSync, renameSync, rmSync } from "node:fs"
import { basename } from "node:path"

import { log } from "./logger"
import {
  CONFIG_BASENAME,
  LEGACY_CONFIG_BASENAME,
  SECONDARY_LEGACY_CONFIG_BASENAME,
} from "./plugin-identity"
import { getCanonicalConfigPath, isLegacyConfigBasename } from "./plugin-config-path"
import { writeFileAtomically } from "./write-file-atomically"

const SUPPORTED_CONFIG_GENERATIONS = [
  CONFIG_BASENAME,
  LEGACY_CONFIG_BASENAME,
  SECONDARY_LEGACY_CONFIG_BASENAME,
] as const

function archiveLegacyConfigFile(legacyPath: string): boolean {
  const backupPath = `${legacyPath}.bak`

  try {
    renameSync(legacyPath, backupPath)
    log("[migrateLegacyConfigFile] Legacy config was migrated and renamed to backup. Update the canonical file only.", {
      legacyPath,
      backupPath,
    })
    return true
  } catch (renameError) {
    try {
      rmSync(legacyPath)
      log("[migrateLegacyConfigFile] Legacy config was migrated and removed after backup rename failed. Update the canonical file only.", {
        legacyPath,
        backupPath,
        renameError,
      })
      return true
    } catch (removeError) {
      log("[migrateLegacyConfigFile] WARNING: canonical config was written but the legacy file still exists and will be ignored. Remove or rename it manually.", {
        legacyPath,
        backupPath,
        renameError,
        removeError,
      })
      return false
    }
  }
}

export function migrateLegacyConfigFile(legacyPath: string): boolean {
  if (!existsSync(legacyPath)) return false

  const base = basename(legacyPath)
  if (!isLegacyConfigBasename(base)) return false

  const canonicalPath = getCanonicalConfigPath(legacyPath)
  if (existsSync(canonicalPath)) {
    const archivedLegacyConfig = archiveLegacyConfigFile(legacyPath)
    log("[migrateLegacyConfigFile] Canonical config already exists. Archived legacy alias when possible.", {
      canonicalPath,
      legacyPath,
      archivedLegacyConfig,
      supportedConfigGenerations: SUPPORTED_CONFIG_GENERATIONS,
    })
    return archivedLegacyConfig
  }

  try {
    const content = readFileSync(legacyPath, "utf-8")
    writeFileAtomically(canonicalPath, content)
    const archivedLegacyConfig = archiveLegacyConfigFile(legacyPath)
    log("[migrateLegacyConfigFile] Migrated legacy config to canonical path", {
      from: legacyPath,
      to: canonicalPath,
      archivedLegacyConfig,
      supportedConfigGenerations: SUPPORTED_CONFIG_GENERATIONS,
    })
    return archivedLegacyConfig
  } catch (error) {
    log("[migrateLegacyConfigFile] Failed to migrate legacy config file", { legacyPath, error })
    return false
  }
}
