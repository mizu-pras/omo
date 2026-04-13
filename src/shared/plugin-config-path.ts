import { basename, dirname, extname, join } from "node:path"

import {
  CONFIG_BASENAME,
  LEGACY_CONFIG_BASENAME,
  SECONDARY_LEGACY_CONFIG_BASENAME,
} from "./plugin-identity"

export const LEGACY_CONFIG_BASENAMES = [
  LEGACY_CONFIG_BASENAME,
  SECONDARY_LEGACY_CONFIG_BASENAME,
] as const

export function isLegacyConfigBasename(fileBasename: string): boolean {
  return LEGACY_CONFIG_BASENAMES.some((legacyBasename) => fileBasename.startsWith(legacyBasename))
}

export function isLegacyConfigPath(filePath: string): boolean {
  return isLegacyConfigBasename(basename(filePath))
}

export function getCanonicalConfigPath(filePath: string): string {
  const extension = extname(filePath) || ".json"
  return join(dirname(filePath), `${CONFIG_BASENAME}${extension}`)
}
