import type { PluginInput } from "@opencode-ai/plugin"
import { log } from "../../shared/logger"
import { findNearestMessageWithFields } from "../../features/hook-message-injector"
import { getMessageDir } from "./message-storage-directory"
import { withTimeout } from "./with-timeout"
import {
	createInternalAgentTextPart,
	normalizeSDKResponse,
	resolveInheritedPromptTools,
} from "../../shared"
import { getAgentConfigKey } from "../../shared/agent-display-names"

type MessageInfo = {
	agent?: string
	model?: { providerID: string; modelID: string; variant?: string }
	modelID?: string
	providerID?: string
	tools?: Record<string, boolean | "allow" | "deny" | "ask">
}

function canonicalizeInheritedAgent(agent: string | undefined): string | undefined {
	if (typeof agent !== "string") {
		return undefined
	}

	const resolvedAgent = getAgentConfigKey(agent)
	switch (resolvedAgent) {
		case "ismaya":
		case "togog":
		case "dewi-sri":
		case "aji-saka":
		case "cenil":
		case "jayabaya":
		case "sabdapalon":
		case "ratu-kidul":
		case "pujangga":
		case "nayagenggong":
		case "surya":
		case "council-member":
			return resolvedAgent
		case "sisyphus":
			return "ismaya"
		case "hephaestus":
			return "togog"
		case "prometheus":
			return "dewi-sri"
		case "atlas":
			return "aji-saka"
		case "sisyphus-junior":
			return "cenil"
		case "metis":
			return "jayabaya"
		case "momus":
			return "sabdapalon"
		case "oracle":
			return "ratu-kidul"
		case "librarian":
			return "pujangga"
		case "explore":
			return "nayagenggong"
		case "multimodal-looker":
			return "surya"
		default:
			return resolvedAgent
	}
}

export async function injectContinuationPrompt(
	ctx: PluginInput,
	options: {
		sessionID: string
		prompt: string
		directory: string
		apiTimeoutMs: number
		inheritFromSessionID?: string
	},
): Promise<void> {
	let agent: string | undefined
	let model: { providerID: string; modelID: string; variant?: string } | undefined
	let tools: Record<string, boolean | "allow" | "deny" | "ask"> | undefined
	const sourceSessionID = options.inheritFromSessionID ?? options.sessionID

	try {
		const messagesResp = await withTimeout(
			ctx.client.session.messages({
				path: { id: sourceSessionID },
			}),
			options.apiTimeoutMs,
		)
		const messages = normalizeSDKResponse(messagesResp, [] as Array<{ info?: MessageInfo }>)
		for (let i = messages.length - 1; i >= 0; i--) {
			const info = messages[i]?.info
			if (info?.agent || info?.model || (info?.modelID && info?.providerID)) {
				agent = canonicalizeInheritedAgent(info.agent)
				model =
					info.model ??
					(info.providerID && info.modelID
						? { providerID: info.providerID, modelID: info.modelID }
						: undefined)
				tools = info.tools
				break
			}
		}
	} catch {
		const messageDir = getMessageDir(sourceSessionID)
		const currentMessage = messageDir ? findNearestMessageWithFields(messageDir) : null
		agent = canonicalizeInheritedAgent(currentMessage?.agent)
		model =
			currentMessage?.model?.providerID && currentMessage?.model?.modelID
				? {
					providerID: currentMessage.model.providerID,
					modelID: currentMessage.model.modelID,
					...(currentMessage.model.variant ? { variant: currentMessage.model.variant } : {}),
				}
				: undefined
		tools = currentMessage?.tools
	}

	const inheritedTools = resolveInheritedPromptTools(sourceSessionID, tools)

	const launchModel = model
		? { providerID: model.providerID, modelID: model.modelID }
		: undefined
	const launchVariant = model?.variant
	const launchAgent = canonicalizeInheritedAgent(agent)

	await ctx.client.session.promptAsync({
		path: { id: options.sessionID },
		body: {
			...(launchAgent !== undefined ? { agent: launchAgent } : {}),
			...(launchModel ? { model: launchModel } : {}),
			...(launchVariant ? { variant: launchVariant } : {}),
			...(inheritedTools ? { tools: inheritedTools } : {}),
			parts: [createInternalAgentTextPart(options.prompt)],
		},
		query: { directory: options.directory },
	})

	log("[ralph-loop] continuation injected", { sessionID: options.sessionID })
}
