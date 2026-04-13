import { existsSync } from "node:fs"
import { join } from "node:path"

import { detectPluginConfigFile, log } from "./shared"
import { getCanonicalConfigPath, isLegacyConfigPath } from "./shared/plugin-config-path"
import { CONFIG_BASENAME } from "./shared/plugin-identity"
import { migrateLegacyConfigFile } from "./shared/migrate-legacy-config-file"

function archiveLegacyAliases(canonicalPath: string, legacyPaths: string[]): void {
  if (legacyPaths.length === 0) return

  const archivedLegacyPaths = legacyPaths.filter((legacyPath) => migrateLegacyConfigFile(legacyPath))
  log("Canonical plugin config detected alongside legacy aliases", {
    canonicalPath,
    legacyPaths,
    archivedLegacyPaths,
  })
}

export function resolvePluginConfigPath(configDir: string): string {
  const detected = detectPluginConfigFile(configDir)
  if (detected.format === "none") {
    return join(configDir, `${CONFIG_BASENAME}.json`)
  }

  if (!isLegacyConfigPath(detected.path)) {
    archiveLegacyAliases(detected.path, detected.legacyPaths)
    return detected.path
  }

  const canonicalPath = getCanonicalConfigPath(detected.path)
  const migrated = migrateLegacyConfigFile(detected.path)
  if (!migrated && !existsSync(canonicalPath)) {
    return detected.path
  }

  archiveLegacyAliases(canonicalPath, detected.legacyPaths)
  return canonicalPath
}
