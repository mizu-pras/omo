import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as builtinCommands from "../features/builtin-commands";
import * as commandLoader from "../features/claude-code-command-loader";
import * as skillLoader from "../features/opencode-skill-loader";
import type { ParaHyangConfig } from "../config";
import type { PluginComponents } from "./plugin-components-loader";
import { applyCommandConfig } from "./command-config-handler";
import {
  getAgentDisplayName,
  getAgentListDisplayName,
} from "../shared/agent-display-names";

function createPluginComponents(): PluginComponents {
  return {
    commands: {},
    skills: {},
    agents: {},
    mcpServers: {},
    hooksConfigs: [],
    plugins: [],
    errors: [],
  };
}

function createPluginConfig(): ParaHyangConfig {
  return {
    git_master: {
      commit_footer: false,
      include_co_authored_by: false,
      git_env_prefix: "",
    },
  };
}

describe("applyCommandConfig", () => {
  let loadBuiltinCommandsSpy: ReturnType<typeof spyOn>;
  let loadUserCommandsSpy: ReturnType<typeof spyOn>;
  let loadProjectCommandsSpy: ReturnType<typeof spyOn>;
  let loadOpencodeGlobalCommandsSpy: ReturnType<typeof spyOn>;
  let loadOpencodeProjectCommandsSpy: ReturnType<typeof spyOn>;
  let discoverConfigSourceSkillsSpy: ReturnType<typeof spyOn>;
  let loadUserSkillsSpy: ReturnType<typeof spyOn>;
  let loadProjectSkillsSpy: ReturnType<typeof spyOn>;
  let loadOpencodeGlobalSkillsSpy: ReturnType<typeof spyOn>;
  let loadOpencodeProjectSkillsSpy: ReturnType<typeof spyOn>;
  let loadProjectAgentsSkillsSpy: ReturnType<typeof spyOn>;
  let loadGlobalAgentsSkillsSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    loadBuiltinCommandsSpy = spyOn(builtinCommands, "loadBuiltinCommands");
    loadBuiltinCommandsSpy.mockReturnValue({});
    loadUserCommandsSpy = spyOn(commandLoader, "loadUserCommands");
    loadUserCommandsSpy.mockResolvedValue({});
    loadProjectCommandsSpy = spyOn(commandLoader, "loadProjectCommands");
    loadProjectCommandsSpy.mockResolvedValue({});
    loadOpencodeGlobalCommandsSpy = spyOn(commandLoader, "loadOpencodeGlobalCommands");
    loadOpencodeGlobalCommandsSpy.mockResolvedValue({});
    loadOpencodeProjectCommandsSpy = spyOn(commandLoader, "loadOpencodeProjectCommands");
    loadOpencodeProjectCommandsSpy.mockResolvedValue({});
    discoverConfigSourceSkillsSpy = spyOn(skillLoader, "discoverConfigSourceSkills");
    discoverConfigSourceSkillsSpy.mockResolvedValue([]);
    loadUserSkillsSpy = spyOn(skillLoader, "loadUserSkills");
    loadUserSkillsSpy.mockResolvedValue({});
    loadProjectSkillsSpy = spyOn(skillLoader, "loadProjectSkills");
    loadProjectSkillsSpy.mockResolvedValue({});
    loadOpencodeGlobalSkillsSpy = spyOn(skillLoader, "loadOpencodeGlobalSkills");
    loadOpencodeGlobalSkillsSpy.mockResolvedValue({});
    loadOpencodeProjectSkillsSpy = spyOn(skillLoader, "loadOpencodeProjectSkills");
    loadOpencodeProjectSkillsSpy.mockResolvedValue({});
    loadProjectAgentsSkillsSpy = spyOn(skillLoader, "loadProjectAgentsSkills");
    loadProjectAgentsSkillsSpy.mockResolvedValue({});
    loadGlobalAgentsSkillsSpy = spyOn(skillLoader, "loadGlobalAgentsSkills");
    loadGlobalAgentsSkillsSpy.mockResolvedValue({});
  });

  afterEach(() => {
    loadBuiltinCommandsSpy.mockRestore();
    loadUserCommandsSpy.mockRestore();
    loadProjectCommandsSpy.mockRestore();
    loadOpencodeGlobalCommandsSpy.mockRestore();
    loadOpencodeProjectCommandsSpy.mockRestore();
    discoverConfigSourceSkillsSpy.mockRestore();
    loadUserSkillsSpy.mockRestore();
    loadProjectSkillsSpy.mockRestore();
    loadOpencodeGlobalSkillsSpy.mockRestore();
    loadOpencodeProjectSkillsSpy.mockRestore();
    loadProjectAgentsSkillsSpy.mockRestore();
    loadGlobalAgentsSkillsSpy.mockRestore();
  });

  test("includes .agents skills in command config", async () => {
    // given
    loadProjectAgentsSkillsSpy.mockResolvedValue({
      "agents-project-skill": {
        description: "(project - Skill) Agents project skill",
        template: "template",
      },
    });
    loadGlobalAgentsSkillsSpy.mockResolvedValue({
      "agents-global-skill": {
        description: "(user - Skill) Agents global skill",
        template: "template",
      },
    });
    const config: Record<string, unknown> = { command: {} };

    // when
    await applyCommandConfig({
      config,
      pluginConfig: createPluginConfig(),
      ctx: { directory: "/tmp" },
      pluginComponents: createPluginComponents(),
    });

    // then
    const commandConfig = config.command as Record<string, { description?: string }>;
    expect(commandConfig["agents-project-skill"]?.description).toContain("Agents project skill");
    expect(commandConfig["agents-global-skill"]?.description).toContain("Agents global skill");
  });

  test("normalizes Aji Saka command agents to the exported list key used by opencode command routing", async () => {
    // given
    loadBuiltinCommandsSpy.mockReturnValue({
      "start-work": {
        name: "start-work",
        description: "(builtin) Start work",
        template: "template",
        agent: "aji-saka",
      },
    });
    const config: Record<string, unknown> = { command: {} };

    // when
    await applyCommandConfig({
      config,
      pluginConfig: createPluginConfig(),
      ctx: { directory: "/tmp" },
      pluginComponents: createPluginComponents(),
    });

    // then
    const commandConfig = config.command as Record<string, { agent?: string }>;
    expect(commandConfig["start-work"]?.agent).toBe(getAgentListDisplayName("aji-saka"));
  });

  test("normalizes legacy display-name command agents to the exported list key", async () => {
    // given
    loadBuiltinCommandsSpy.mockReturnValue({
      "start-work": {
        name: "start-work",
        description: "(builtin) Start work",
        template: "template",
        agent: getAgentDisplayName("aji-saka"),
      },
    });
    const config: Record<string, unknown> = { command: {} };

    // when
    await applyCommandConfig({
      config,
      pluginConfig: createPluginConfig(),
      ctx: { directory: "/tmp" },
      pluginComponents: createPluginComponents(),
    });

    // then
    const commandConfig = config.command as Record<string, { agent?: string }>;
    expect(commandConfig["start-work"]?.agent).toBe(getAgentListDisplayName("aji-saka"));
  });
});
