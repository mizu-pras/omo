import type { PluginInput } from "@opencode-ai/plugin"
import { isGptModel } from "../../agents/types"
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

const TOAST_TITLE = "NEVER Use Togog with Non-GPT"
const TOAST_MESSAGE = [
  "Togog is designed exclusively for GPT models.",
  "Togog is trash without GPT.",
  "For Claude/Kimi/GLM models, always use Ismaya.",
].join("\n")
type NoTogogNonGptHookOptions = {
  allowNonGptModel?: boolean
}

function showToast(ctx: PluginInput, sessionID: string, variant: "error" | "warning"): void {
  ctx.client.tui.showToast({
    body: {
      title: TOAST_TITLE,
      message: TOAST_MESSAGE,
      variant,
      duration: 10000,
    },
  }).catch((error) => {
    log("[no-togog-non-gpt] Failed to show toast", {
      sessionID,
      error,
    })
  })
}

export function createNoTogogNonGptHook(
  ctx: PluginInput,
  options?: NoTogogNonGptHookOptions,
) {
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
      const allowNonGptModel = options?.allowNonGptModel === true

      if (agentKey === "togog" && modelID && !isGptModel(modelID)) {
        showToast(ctx, input.sessionID, allowNonGptModel ? "warning" : "error")
        if (allowNonGptModel) {
          return
        }
        input.agent = resolveRegisteredAgentName("ismaya") ?? "ismaya"
        if (output?.message) {
          output.message.agent = resolveRegisteredAgentName("ismaya") ?? "ismaya"
        }
        updateSessionAgent(input.sessionID, "ismaya")
      }
    },
  }
}
