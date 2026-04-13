import * as path from "path";
import { ParaHyangConfigSchema, type ParaHyangConfig } from "./config";
import { log, deepMerge, getOpenCodeConfigDir } from "./shared";
import { loadConfigFromPath } from "./plugin-config-loader";
import { resolvePluginConfigPath } from "./plugin-config-path-resolver";

export { parseConfigPartially } from "./plugin-config-loader";

export function mergeConfigs(
  base: ParaHyangConfig,
  override: ParaHyangConfig
): ParaHyangConfig {
  return {
    ...base,
    ...override,
    agents: deepMerge(base.agents, override.agents),
    categories: deepMerge(base.categories, override.categories),
    disabled_agents: [
      ...new Set([
        ...(base.disabled_agents ?? []),
        ...(override.disabled_agents ?? []),
      ]),
    ],
    disabled_mcps: [
      ...new Set([
        ...(base.disabled_mcps ?? []),
        ...(override.disabled_mcps ?? []),
      ]),
    ],
    disabled_hooks: [
      ...new Set([
        ...(base.disabled_hooks ?? []),
        ...(override.disabled_hooks ?? []),
      ]),
    ],
    disabled_commands: [
      ...new Set([
        ...(base.disabled_commands ?? []),
        ...(override.disabled_commands ?? []),
      ]),
    ],
    disabled_skills: [
      ...new Set([
        ...(base.disabled_skills ?? []),
        ...(override.disabled_skills ?? []),
      ]),
    ],
    disabled_tools: [
      ...new Set([
        ...(base.disabled_tools ?? []),
        ...(override.disabled_tools ?? []),
      ]),
    ],
    mcp_env_allowlist: [
      ...new Set([
        ...(base.mcp_env_allowlist ?? []),
        ...(override.mcp_env_allowlist ?? []),
      ]),
    ],
    claude_code: deepMerge(base.claude_code, override.claude_code),
  };
}

export function loadPluginConfig(
  directory: string,
  ctx: unknown
): ParaHyangConfig {
  const configDir = getOpenCodeConfigDir({ binary: "opencode" });
  const userConfigPath = resolvePluginConfigPath(configDir)
  const projectConfigPath = resolvePluginConfigPath(path.join(directory, ".opencode"))

  // Load user config first (base). Parse empty config through Zod to apply field defaults.
  const userConfig = loadConfigFromPath(userConfigPath, ctx)
  let config: ParaHyangConfig =
    userConfig ?? ParaHyangConfigSchema.parse({});

  // Override with project config
  const projectConfig = loadConfigFromPath(projectConfigPath, ctx);
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }

  config = {
    ...config,
    mcp_env_allowlist: userConfig?.mcp_env_allowlist ?? [],
  };

  log("Final merged config", {
    agents: config.agents,
    disabled_agents: config.disabled_agents,
    disabled_mcps: config.disabled_mcps,
    disabled_hooks: config.disabled_hooks,
    claude_code: config.claude_code,
  });
  return config;
}
