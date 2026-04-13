import { getSessionAgent } from "../../features/claude-code-session-state"
import { getAgentConfigKey } from "../../shared/agent-display-names"
import { AGENT_NAME_MAP } from "../../shared/migration/agent-names"

export const AGENT_NAMES = [
  "ismaya",
  "ratu-kidul",
  "pujangga",
  "nayagenggong",
  "dewi-sri",
  "aji-saka",
  "jayabaya",
  "sabdapalon",
  "togog",
  "cenil",
  "build",
  "plan",
  "surya",
]

export const agentPattern = new RegExp(
  `\\b(${AGENT_NAMES
    .sort((a, b) => b.length - a.length)
    .map((a) => a.replace(/-/g, "\\-"))
    .join("|")})\\b`,
  "i",
)

export function detectAgentFromSession(sessionID: string): string | undefined {
  const match = sessionID.match(agentPattern)
  if (match) {
    return match[1].toLowerCase()
  }
  return undefined
}

export function normalizeAgentName(agent: string | undefined): string | undefined {
  if (!agent) return undefined
  const normalized = agent.toLowerCase().trim()
  if (AGENT_NAMES.includes(normalized)) {
    return normalized
  }
  const configKey = getAgentConfigKey(agent)
  const canonical = AGENT_NAME_MAP[configKey] ?? AGENT_NAME_MAP[configKey.toLowerCase()] ?? configKey
  if (AGENT_NAMES.includes(canonical)) {
    return canonical
  }
  const match = normalized.match(agentPattern)
  if (match) {
    return match[1].toLowerCase()
  }
  return undefined
}

export function resolveAgentForSession(sessionID: string, eventAgent?: string): string | undefined {
  return (
    normalizeAgentName(eventAgent) ??
    normalizeAgentName(getSessionAgent(sessionID)) ??
    detectAgentFromSession(sessionID)
  )
}
