import { describe, test, expect } from "bun:test"
import { migrateAgentNames } from "./migration"
import { getAgentDisplayName } from "./agent-display-names"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("Agent Config Integration", () => {
  describe("Old format config migration", () => {
    test("migrates old format agent keys to lowercase", () => {
      // given - config with old format keys
      const oldConfig = {
        Sisyphus: { model: "anthropic/claude-opus-4-6" },
        Atlas: { model: "anthropic/claude-opus-4-6" },
        "Prometheus - Plan Builder": { model: "anthropic/claude-opus-4-6" },
        "Metis - Plan Consultant": { model: "anthropic/claude-sonnet-4-6" },
        "Momus - Plan Critic": { model: "anthropic/claude-sonnet-4-6" },
      }

      // when - migration is applied
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("ismaya")
      expect(result.migrated).toHaveProperty("aji-saka")
      expect(result.migrated).toHaveProperty("dewi-sri")
      expect(result.migrated).toHaveProperty("jayabaya")
      expect(result.migrated).toHaveProperty("sabdapalon")

      // then - old keys are removed
      expect(result.migrated).not.toHaveProperty("Sisyphus")
      expect(result.migrated).not.toHaveProperty("Atlas")
      expect(result.migrated).not.toHaveProperty("Dewi Sri")
      expect(result.migrated).not.toHaveProperty("Jayabaya")
      expect(result.migrated).not.toHaveProperty("Sabdapalon")

      // then - values are preserved
      expect(result.migrated.ismaya).toEqual({ model: "anthropic/claude-opus-4-6" })
      expect(result.migrated["aji-saka"]).toEqual({ model: "anthropic/claude-opus-4-6" })
      expect(result.migrated["dewi-sri"]).toEqual({ model: "anthropic/claude-opus-4-6" })
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })

    test("preserves already lowercase keys", () => {
      // given - config with lowercase keys
      const config = {
        sisyphus: { model: "anthropic/claude-opus-4-6" },
        "ratu-kidul": { model: "openai/gpt-5.4" },
        pujangga: { model: "opencode/big-pickle" },
      }

      // when - migration is applied
      const result = migrateAgentNames(config)

      // then - keys remain unchanged
      expect(result.migrated).toEqual({
        ismaya: { model: "anthropic/claude-opus-4-6" },
        "ratu-kidul": { model: "openai/gpt-5.4" },
        pujangga: { model: "opencode/big-pickle" },
      })
      
      // then - changed flag is false
      expect(result.changed).toBe(true)
    })

    test("handles mixed case config", () => {
      // given - config with mixed old and new format
      const mixedConfig = {
        Sisyphus: { model: "anthropic/claude-opus-4-6" },
        "ratu-kidul": { model: "openai/gpt-5.4" },
        "Prometheus - Plan Builder": { model: "anthropic/claude-opus-4-6" },
        pujangga: { model: "opencode/big-pickle" },
      }

      // when - migration is applied
      const result = migrateAgentNames(mixedConfig)

      // then - all keys are lowercase
      expect(result.migrated).toHaveProperty("ismaya")
      expect(result.migrated).toHaveProperty("ratu-kidul")
      expect(result.migrated).toHaveProperty("dewi-sri")
      expect(result.migrated).toHaveProperty("pujangga")
      expect(Object.keys(result.migrated).every((key) => key === key.toLowerCase())).toBe(true)
      
      // then - changed flag is true
      expect(result.changed).toBe(true)
    })
  })

  describe("Display name resolution", () => {
    test("returns correct display names for all builtin agents", () => {
      // given - lowercase config keys
      const agents = ["ismaya", "togog", "dewi-sri", "aji-saka", "jayabaya", "sabdapalon", "ratu-kidul", "pujangga", "nayagenggong", "surya"]

      // when - display names are requested
      const displayNames = agents.map((agent) => getAgentDisplayName(agent))

      // then - display names are correct
      expect(displayNames).toContain("Sang Hyang Ismaya")
      expect(displayNames).toContain("Togog")
      expect(displayNames).toContain("Dewi Sri")
      expect(displayNames).toContain("Aji Saka")
      expect(displayNames).toContain("Jayabaya")
      expect(displayNames).toContain("Sabdapalon")
      expect(displayNames).toContain("Kanjeng Ratu Kidul")
      expect(displayNames).toContain("Ki Pujangga")
      expect(displayNames).toContain("Nayagenggong")
      expect(displayNames).toContain("Batara Surya")
    })

    test("handles lowercase keys case-insensitively", () => {
      // given - various case formats of lowercase keys
      const keys = ["Sisyphus", "Atlas", "SISYPHUS", "aji-saka", "dewi-sri", "PROMETHEUS"]

      // when - display names are requested
      const displayNames = keys.map((key) => getAgentDisplayName(key))

      // then - correct display names are returned
      expect(displayNames[0]).toBe("Sang Hyang Ismaya")
      expect(displayNames[1]).toBe("Aji Saka")
      expect(displayNames[2]).toBe("Sang Hyang Ismaya")
      expect(displayNames[3]).toBe("Aji Saka")
      expect(displayNames[4]).toBe("Dewi Sri")
      expect(displayNames[5]).toBe("Dewi Sri")
    })

    test("returns original key for unknown agents", () => {
      // given - unknown agent key
      const unknownKey = "custom-agent"

      // when - display name is requested
      const displayName = getAgentDisplayName(unknownKey)

      // then - original key is returned
      expect(displayName).toBe(unknownKey)
    })
  })

  describe("Model requirements integration", () => {
    test("all model requirements use lowercase keys", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking key format
      const allLowercase = agentKeys.every((key) => key === key.toLowerCase())

      // then - all keys are lowercase
      expect(allLowercase).toBe(true)
    })

    test("model requirements include all builtin agents", () => {
      // given - expected builtin agents
      const expectedAgents = ["ismaya", "togog", "dewi-sri", "aji-saka", "jayabaya", "sabdapalon", "ratu-kidul", "pujangga", "nayagenggong", "surya"]

      // when - checking AGENT_MODEL_REQUIREMENTS
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // then - all expected agents are present
      for (const agent of expectedAgents) {
        expect(agentKeys).toContain(agent)
      }
    })

    test("no uppercase keys in model requirements", () => {
      // given - AGENT_MODEL_REQUIREMENTS object
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      // when - checking for uppercase keys
      const uppercaseKeys = agentKeys.filter((key) => key !== key.toLowerCase())

      // then - no uppercase keys exist
      expect(uppercaseKeys).toEqual([])
    })
  })

  describe("End-to-end config flow", () => {
    test("old config migrates and displays correctly", () => {
      // given - old format config
      const oldConfig = {
        Sisyphus: { model: "anthropic/claude-opus-4-6", temperature: 0.1 },
        "Prometheus - Plan Builder": { model: "anthropic/claude-opus-4-6" },
      }

      // when - config is migrated
      const result = migrateAgentNames(oldConfig)

      // then - keys are lowercase
      expect(result.migrated).toHaveProperty("ismaya")
      expect(result.migrated).toHaveProperty("dewi-sri")

      // when - display names are retrieved
      const sisyphusDisplay = getAgentDisplayName("ismaya")
      const prometheusDisplay = getAgentDisplayName("dewi-sri")

      // then - display names are correct
      expect(sisyphusDisplay).toBe("Sang Hyang Ismaya")
      expect(prometheusDisplay).toBe("Dewi Sri")

      // then - config values are preserved
      expect(result.migrated.ismaya).toEqual({ model: "anthropic/claude-opus-4-6", temperature: 0.1 })
      expect(result.migrated["dewi-sri"]).toEqual({ model: "anthropic/claude-opus-4-6" })
    })

    test("new config works without migration", () => {
      // given - new format config (already lowercase)
      const newConfig = {
        ismaya: { model: "anthropic/claude-opus-4-6" },
        "aji-saka": { model: "anthropic/claude-opus-4-6" },
      }

      // when - migration is applied (should be no-op)
      const result = migrateAgentNames(newConfig)

      // then - config is unchanged
      expect(result.migrated).toEqual(newConfig)
      
      // then - changed flag is false
      expect(result.changed).toBe(false)

      // when - display names are retrieved
      const sisyphusDisplay = getAgentDisplayName("ismaya")
      const atlasDisplay = getAgentDisplayName("aji-saka")

      // then - display names are correct
      expect(sisyphusDisplay).toBe("Sang Hyang Ismaya")
      expect(atlasDisplay).toBe("Aji Saka")
    })
  })
})
