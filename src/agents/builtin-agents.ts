import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"
import type { CategoriesConfig, GitMasterConfig } from "../config/schema"
import type { LoadedSkill } from "../features/opencode-skill-loader/types"
import type { BrowserAutomationProvider } from "../config/schema"
import { createSisyphusAgent } from "./ismaya"
import { createOracleAgent, ORACLE_PROMPT_METADATA } from "./ratu-kidul"
import { createLibrarianAgent, LIBRARIAN_PROMPT_METADATA } from "./pujangga"
import { createExploreAgent, EXPLORE_PROMPT_METADATA } from "./nayagenggong"
import { createMultimodalLookerAgent, MULTIMODAL_LOOKER_PROMPT_METADATA } from "./surya"
import { createMetisAgent, metisPromptMetadata } from "./jayabaya"
import { createAtlasAgent, atlasPromptMetadata } from "./aji-saka"
import { createMomusAgent, momusPromptMetadata } from "./sabdapalon"
import { createHephaestusAgent } from "./togog"
import { createSisyphusJuniorAgentWithOverrides } from "./cenil"
import type { AvailableCategory } from "./dynamic-agent-prompt-builder"
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  readProviderModelsCache,
} from "../shared"
import { CATEGORY_DESCRIPTIONS } from "../tools/delegate-task/constants"
import { mergeCategories } from "../shared/merge-categories"
import { buildAvailableSkills } from "./builtin-agents/available-skills"
import { collectPendingBuiltinAgents } from "./builtin-agents/general-agents"
import { maybeCreateSisyphusConfig } from "./builtin-agents/sisyphus-agent"
import { maybeCreateHephaestusConfig } from "./builtin-agents/hephaestus-agent"
import { maybeCreateAtlasConfig } from "./builtin-agents/atlas-agent"
import { AGENT_NAME_MAP } from "../shared/migration/agent-names"

type AgentSource = AgentFactory | AgentConfig

const LEGACY_BUILTIN_AGENT_ALIASES: Record<string, string> = {
	"sisyphus": "ismaya",
	"hephaestus": "togog",
	"oracle": "ratu-kidul",
	"librarian": "pujangga",
	"explore": "nayagenggong",
	"multimodal-looker": "surya",
	"metis": "jayabaya",
	"momus": "sabdapalon",
	"prometheus": "dewi-sri",
	"atlas": "aji-saka",
	"sisyphus-junior": "cenil",
}

function normalizeDisabledAgents(disabledAgents: string[]): string[] {
	return disabledAgents.map((agent) => AGENT_NAME_MAP[agent] ?? AGENT_NAME_MAP[agent.toLowerCase()] ?? agent)
}

function normalizeAgentOverrides(agentOverrides: AgentOverrides): AgentOverrides {
	const normalized: AgentOverrides = { ...agentOverrides }

	for (const [key, value] of Object.entries(agentOverrides)) {
		const canonicalKey = LEGACY_BUILTIN_AGENT_ALIASES[key.toLowerCase()]
		if (!canonicalKey || normalized[canonicalKey as keyof AgentOverrides] !== undefined) {
			continue
		}
		normalized[canonicalKey as keyof AgentOverrides] = value
	}

	return normalized
}

function attachLegacyAgentAliases(result: Record<string, AgentConfig>): Record<string, AgentConfig> {
	for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_BUILTIN_AGENT_ALIASES)) {
		if (!(canonicalKey in result) || legacyKey in result) {
			continue
		}

		Object.defineProperty(result, legacyKey, {
			configurable: true,
			enumerable: false,
			get: () => result[canonicalKey],
		})
	}

	return result
}

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  ismaya: createSisyphusAgent,
  togog: createHephaestusAgent,
  "ratu-kidul": createOracleAgent,
  pujangga: createLibrarianAgent,
  nayagenggong: createExploreAgent,
  surya: createMultimodalLookerAgent,
  jayabaya: createMetisAgent,
  sabdapalon: createMomusAgent,
  // Note: Aji-Saka is handled specially in createBuiltinAgents()
  // because it needs OrchestratorContext, not just a model string
  "aji-saka": createAtlasAgent as AgentFactory,
  cenil: createSisyphusJuniorAgentWithOverrides as unknown as AgentFactory,
}

/**
 * Metadata for each agent, used to build Sisyphus's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  "ratu-kidul": ORACLE_PROMPT_METADATA,
  pujangga: LIBRARIAN_PROMPT_METADATA,
  nayagenggong: EXPLORE_PROMPT_METADATA,
  surya: MULTIMODAL_LOOKER_PROMPT_METADATA,
  jayabaya: metisPromptMetadata,
  sabdapalon: momusPromptMetadata,
  "aji-saka": atlasPromptMetadata,
}

export async function createBuiltinAgents(
  disabledAgents: string[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  discoveredSkills: LoadedSkill[] = [],
  customAgentSummaries?: unknown,
  browserProvider?: BrowserAutomationProvider,
  uiSelectedModel?: string,
  disabledSkills?: Set<string>,
  useTaskSystem = false,
  disableOmoEnv = false
): Promise<Record<string, AgentConfig>> {
	const normalizedDisabledAgents = normalizeDisabledAgents(disabledAgents)
	const normalizedAgentOverrides = normalizeAgentOverrides(agentOverrides)

  const connectedProviders = readConnectedProvidersCache()
  const providerModelsConnected = connectedProviders
    ? (readProviderModelsCache()?.connected ?? [])
    : []
  const mergedConnectedProviders = Array.from(
    new Set([...(connectedProviders ?? []), ...providerModelsConnected])
  )
  // IMPORTANT: Do NOT call OpenCode client APIs during plugin initialization.
  // This function is called from config handler, and calling client API causes deadlock.
  // See: https://github.com/mizu-pras/omo/issues/1301
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: mergedConnectedProviders.length > 0 ? mergedConnectedProviders : undefined,
  })
  const isFirstRunNoCache =
    availableModels.size === 0 && mergedConnectedProviders.length === 0

  const result: Record<string, AgentConfig> = {}

  const mergedCategories = mergeCategories(categories)

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(([name]) => ({
    name,
    description: categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
  }))

  const availableSkills = buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills)

  // Collect general agents first (for availableAgents), but don't add to result yet
  const { pendingAgentConfigs, availableAgents } = collectPendingBuiltinAgents({
    agentSources,
    agentMetadata,
	    disabledAgents: normalizedDisabledAgents,
	    agentOverrides: normalizedAgentOverrides,
    directory,
    systemDefaultModel,
    mergedCategories,
    gitMasterConfig,
    browserProvider,
    uiSelectedModel,
    availableModels,
    isFirstRunNoCache,
    disabledSkills,
    disableOmoEnv,
  })

  const sisyphusConfig = maybeCreateSisyphusConfig({
	    disabledAgents: normalizedDisabledAgents,
	    agentOverrides: normalizedAgentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    userCategories: categories,
    useTaskSystem,
    disableOmoEnv,
  })
  if (sisyphusConfig) {
    result["ismaya"] = sisyphusConfig
  }

  const hephaestusConfig = maybeCreateHephaestusConfig({
	    disabledAgents: normalizedDisabledAgents,
	    agentOverrides: normalizedAgentOverrides,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv,
  })
  if (hephaestusConfig) {
    result["togog"] = hephaestusConfig
  }

  // Add pending agents after sisyphus and hephaestus to maintain order
  for (const [name, config] of pendingAgentConfigs) {
    result[name] = config
  }

  const atlasConfig = maybeCreateAtlasConfig({
	    disabledAgents: normalizedDisabledAgents,
	    agentOverrides: normalizedAgentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories: categories,
  })
  if (atlasConfig) {
    result["aji-saka"] = atlasConfig
  }

	  return attachLegacyAgentAliases(result)
}
