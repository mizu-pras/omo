import { getAgentConfigKey } from "./agent-display-names"
import { AGENT_NAME_MAP } from "./migration/agent-names"

/**
 * Agent tool restrictions for session.prompt calls.
 * OpenCode SDK's session.prompt `tools` parameter expects boolean values.
 * true = tool allowed, false = tool denied.
 */

const EXPLORATION_AGENT_DENYLIST: Record<string, boolean> = {
  write: false,
  edit: false,
  task: false,
  call_omo_agent: false,
}

const AGENT_RESTRICTIONS: Record<string, Record<string, boolean>> = {
  nayagenggong: EXPLORATION_AGENT_DENYLIST,

  pujangga: EXPLORATION_AGENT_DENYLIST,

  "ratu-kidul": {
    write: false,
    edit: false,
    task: false,
    call_omo_agent: false,
  },

  jayabaya: {
    write: false,
    edit: false,
    task: false,
  },

  sabdapalon: {
    write: false,
    edit: false,
    task: false,
  },

  surya: {
    read: true,
  },

  cenil: {
    task: false,
  },
}

export function getAgentToolRestrictions(agentName: string): Record<string, boolean> {
  const configKey = getAgentConfigKey(agentName)
  const canonicalName = AGENT_NAME_MAP[configKey] ?? AGENT_NAME_MAP[configKey.toLowerCase()] ?? configKey

  return AGENT_RESTRICTIONS[canonicalName]
    ?? Object.entries(AGENT_RESTRICTIONS).find(([key]) => key.toLowerCase() === canonicalName.toLowerCase())?.[1]
    ?? {}
}

export function hasAgentToolRestrictions(agentName: string): boolean {
  const configKey = getAgentConfigKey(agentName)
  const canonicalName = AGENT_NAME_MAP[configKey] ?? AGENT_NAME_MAP[configKey.toLowerCase()] ?? configKey
  const restrictions = AGENT_RESTRICTIONS[canonicalName]
    ?? Object.entries(AGENT_RESTRICTIONS).find(([key]) => key.toLowerCase() === canonicalName.toLowerCase())?.[1]
  return restrictions !== undefined && Object.keys(restrictions).length > 0
}
