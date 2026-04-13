import { getAgentConfigKey } from "../../shared/agent-display-names"
import { DEWI_SRI_AGENT } from "./constants"

export function isDewiSriAgent(agentName: string | undefined): boolean {
  if (!agentName) {
    return false
  }

  return getAgentConfigKey(agentName) === DEWI_SRI_AGENT
}
