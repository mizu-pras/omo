import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel, isGpt5_4Model } from "../../agents/types"
import {
  getSessionAgent,
  resolveRegisteredAgentName,
  updateSessionAgent,
} from "../../features/claude-code-session-state"
import { log } from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"
import { AGENT_NAME_MAP } from "../../shared/migration/agent-names"

function getCanonicalAgentKey(agentName: string): string {
  const configKey = getAgentConfigKey(agentName)
  return AGENT_NAME_MAP[configKey] ?? AGENT_NAME_MAP[configKey.toLowerCase()] ?? configKey
}

const TOAST_TITLE = "NEVER Use Ismaya with GPT"
const TOAST_MESSAGE = [
  "Ismaya works best with Claude Opus, and works fine with Kimi/GLM models.",
  "Do NOT use Ismaya with GPT (except GPT-5.4 which has specialized support).",
  "For GPT models (other than 5.4), always use Togog.",
].join("\n")
function showToast(ctx: PluginInput, sessionID: string): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant: "error",
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-ismaya-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoIsmayaGptHook(ctx: PluginInput) {
  return {
    "chat.message": async (input: {
      sessionID: string
      agent?: string
      model?: { providerID: string; modelID: string }
    }, output?: {
      message?: { agent?: string; [key: string]: unknown }
    }): Promise<void> => {
      const rawAgent = input.agent ?? getSessionAgent(input.sessionID) ?? ""
      const agentKey = getCanonicalAgentKey(rawAgent)
      const modelID = input.model?.modelID

      if (agentKey === "ismaya" && modelID && isGptModel(modelID) && !isGpt5_4Model(modelID)) {
        showToast(ctx, input.sessionID)
        input.agent = resolveRegisteredAgentName("togog") ?? "togog"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("togog") ?? "togog"
        }
        updateSessionAgent(input.sessionID, "togog")
      }
    },
  }
}
