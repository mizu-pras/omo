import { AGENT_NAME_MAP } from "./migration/agent-names"

/**
 * Agent config keys to display names mapping.
 * Config keys are lowercase (e.g., "ismaya", "aji-saka").
 * Display names are the approved UI/log labels (e.g., "Sang Hyang Ismaya").
 *
 * IMPORTANT: Display names MUST NOT contain parentheses or other characters
 * that are invalid in HTTP header values per RFC 7230. OpenCode passes the
 * agent name in the `x-opencode-agent-name` header, and parentheses cause
 * header validation failures that prevent agents from appearing in the UI
 * type selector dropdown. Use ` - ` (space-dash-space) instead of `(...)`.
 */
export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  ismaya: "Sang Hyang Ismaya",
  togog: "Togog",
  "dewi-sri": "Dewi Sri",
  "aji-saka": "Aji Saka",
  cenil: "Cenil",
  jayabaya: "Jayabaya",
  sabdapalon: "Sabdapalon",
  "ratu-kidul": "Kanjeng Ratu Kidul",
  pujangga: "Ki Pujangga",
  nayagenggong: "Nayagenggong",
  surya: "Batara Surya",
  "council-member": "council-member",
  // Legacy aliases
  sisyphus: "Sang Hyang Ismaya",
  hephaestus: "Togog",
  prometheus: "Dewi Sri",
  atlas: "Aji Saka",
  "sisyphus-junior": "Cenil",
  metis: "Jayabaya",
  momus: "Sabdapalon",
  oracle: "Kanjeng Ratu Kidul",
  librarian: "Ki Pujangga",
  explore: "Nayagenggong",
  "multimodal-looker": "Batara Surya",
  athena: "Athena - Council",
  "athena-junior": "Athena-Junior - Council",
}

const AGENT_LIST_SORT_PREFIXES: Record<string, string> = {
  ismaya: "\u200B",
  togog: "\u200B\u200B",
  "dewi-sri": "\u200B\u200B\u200B",
  "aji-saka": "\u200B\u200B\u200B\u200B",
}

export function stripAgentListSortPrefix(agentName: string): string {
  return agentName.replace(/^\u200B+/, "")
}

/**
 * Get display name for an agent config key.
 * Uses case-insensitive lookup for backward compatibility.
 * Returns original key if not found.
 */
export function getAgentDisplayName(configKey: string): string {
  // Try exact match first
  const exactMatch = AGENT_DISPLAY_NAMES[configKey]
  if (exactMatch !== undefined) return exactMatch
  
  // Fall back to case-insensitive search
  const lowerKey = configKey.toLowerCase()
  for (const [k, v] of Object.entries(AGENT_DISPLAY_NAMES)) {
    if (k.toLowerCase() === lowerKey) return v
  }
  
  // Unknown agent: return original key
  return configKey
}

/**
 * @deprecated Do NOT use for config.agent keys or API-facing names.
 * ZWSP prefixes leak into the /agent API response and break prompt_async consumers.
 * Use getAgentDisplayName() instead. The `order` field injected by
 * reorderAgentsByPriority() handles sort ordering without invisible characters.
 * See: https://github.com/mizu-pras/omo/issues/3238
 */
export function getAgentListDisplayName(configKey: string): string {
  const displayName = getAgentDisplayName(configKey)
  const prefix = AGENT_LIST_SORT_PREFIXES[configKey.toLowerCase()]

  return prefix ? `${prefix}${displayName}` : displayName
}

function isLegacyDisplayNameKey(configKey: string): boolean {
  return AGENT_NAME_MAP[configKey] !== undefined || AGENT_NAME_MAP[configKey.toLowerCase()] !== undefined
}

function canonicalizeAgentConfigKey(configKey: string): string {
  return AGENT_NAME_MAP[configKey] ?? AGENT_NAME_MAP[configKey.toLowerCase()] ?? configKey
}

const REVERSE_DISPLAY_NAMES: Record<string, string> = {}

for (const [configKey, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
  if (isLegacyDisplayNameKey(configKey)) {
    continue
  }

  const normalizedDisplayName = displayName.toLowerCase()
  if (REVERSE_DISPLAY_NAMES[normalizedDisplayName] === undefined) {
    REVERSE_DISPLAY_NAMES[normalizedDisplayName] = configKey
  }
}

for (const [configKey, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
  const normalizedDisplayName = displayName.toLowerCase()
  if (REVERSE_DISPLAY_NAMES[normalizedDisplayName] === undefined) {
    REVERSE_DISPLAY_NAMES[normalizedDisplayName] = configKey
  }
}

// Legacy parenthesized display names for backward compatibility.
// Old configs/sessions may reference these names; resolve them to config keys.
const LEGACY_DISPLAY_NAMES: Record<string, string> = {
  "sisyphus - ultraworker": "ismaya",
  "sisyphus (ultraworker)": "ismaya",
  "hephaestus - deep agent": "togog",
  "hephaestus (deep agent)": "togog",
  "prometheus - plan builder": "dewi-sri",
  "prometheus (plan builder)": "dewi-sri",
  "atlas - plan executor": "aji-saka",
  "atlas (plan executor)": "aji-saka",
  "metis - plan consultant": "jayabaya",
  "metis (plan consultant)": "jayabaya",
  "momus - plan critic": "sabdapalon",
  "momus (plan critic)": "sabdapalon",
  "athena (council)": "athena",
  "athena-junior (council)": "athena-junior",
}

/**
 * Resolve an agent name (display name or config key) to its lowercase config key.
  * "Aji Saka" -> "aji-saka", "Atlas - Plan Executor" -> "aji-saka", "aji-saka" -> "aji-saka"
 */
export function getAgentConfigKey(agentName: string): string {
  const lower = stripAgentListSortPrefix(agentName).toLowerCase()
  const reversed = REVERSE_DISPLAY_NAMES[lower]
  if (reversed !== undefined) return canonicalizeAgentConfigKey(reversed)
  const legacy = LEGACY_DISPLAY_NAMES[lower]
  if (legacy !== undefined) return canonicalizeAgentConfigKey(legacy)
  if (AGENT_DISPLAY_NAMES[lower] !== undefined) return canonicalizeAgentConfigKey(lower)
  return lower
}

/**
 * Normalize an agent name for prompt APIs.
 * - Known display names -> canonical display names
 * - Known config keys (any case) -> canonical display names
 * - Unknown/custom names -> preserved as-is (trimmed)
 */
export function normalizeAgentForPrompt(agentName: string | undefined): string | undefined {
  if (typeof agentName !== "string") {
    return undefined
  }

  const trimmed = stripAgentListSortPrefix(agentName.trim())
  if (!trimmed) {
    return undefined
  }

  const lower = trimmed.toLowerCase()
  const reversed = REVERSE_DISPLAY_NAMES[lower]
  if (reversed !== undefined) {
    return AGENT_DISPLAY_NAMES[canonicalizeAgentConfigKey(reversed)] ?? trimmed
  }
  const legacy = LEGACY_DISPLAY_NAMES[lower]
  if (legacy !== undefined) {
    return AGENT_DISPLAY_NAMES[canonicalizeAgentConfigKey(legacy)] ?? trimmed
  }
  if (AGENT_DISPLAY_NAMES[lower] !== undefined) {
    return AGENT_DISPLAY_NAMES[canonicalizeAgentConfigKey(lower)]
  }

  return trimmed
}

export function normalizeAgentForPromptKey(agentName: string | undefined): string | undefined {
  if (typeof agentName !== "string") {
    return undefined
  }

  const trimmed = stripAgentListSortPrefix(agentName.trim())
  if (!trimmed) {
    return undefined
  }

  const lower = trimmed.toLowerCase()
  const reversed = REVERSE_DISPLAY_NAMES[lower]
  if (reversed !== undefined) {
    return canonicalizeAgentConfigKey(reversed)
  }
  const legacy = LEGACY_DISPLAY_NAMES[lower]
  if (legacy !== undefined) {
    return canonicalizeAgentConfigKey(legacy)
  }
  if (AGENT_DISPLAY_NAMES[lower] !== undefined) {
    return canonicalizeAgentConfigKey(lower)
  }

  return trimmed
}
