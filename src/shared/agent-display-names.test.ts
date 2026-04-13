import { describe, it, expect } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentConfigKey, getAgentDisplayName, getAgentListDisplayName, normalizeAgentForPrompt, normalizeAgentForPromptKey } from "./agent-display-names"

describe("getAgentDisplayName", () => {
  it("returns display name for lowercase config key (new format)", () => {
    // given config key "sisyphus"
    const configKey = "ismaya"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Sisyphus - Ultraworker"
    expect(result).toBe("Sang Hyang Ismaya")
  })

  it("returns display name for uppercase config key (old format - case-insensitive)", () => {
    // given config key "Sisyphus" (old format)
    const configKey = "Sisyphus"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Sisyphus - Ultraworker" (case-insensitive lookup)
    expect(result).toBe("Sang Hyang Ismaya")
  })

  it("returns original key for unknown agents (fallback)", () => {
    // given config key "custom-agent"
    const configKey = "custom-agent"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "custom-agent" (original key unchanged)
    expect(result).toBe("custom-agent")
  })

  it("returns display name for atlas", () => {
    // given config key "atlas"
    const configKey = "aji-saka"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Atlas - Plan Executor"
    expect(result).toBe("Aji Saka")
  })

  it("returns display name for prometheus", () => {
    // given config key "prometheus"
    const configKey = "dewi-sri"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Prometheus - Plan Builder"
    expect(result).toBe("Dewi Sri")
  })

  it("returns display name for sisyphus-junior", () => {
    // given config key "sisyphus-junior"
    const configKey = "cenil"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Sisyphus-Junior"
    expect(result).toBe("Cenil")
  })

  it("returns display name for metis", () => {
    // given config key "metis"
    const configKey = "jayabaya"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "Metis - Plan Consultant"
    expect(result).toBe("Jayabaya")
  })

  it("returns display name for momus", () => {
    // given config key "momus"
    const configKey = "sabdapalon"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

     // then returns "Momus - Plan Critic"
    expect(result).toBe("Sabdapalon")
  })

  it("returns display name for oracle", () => {
    // given config key "oracle"
    const configKey = "ratu-kidul"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "oracle"
    expect(result).toBe("Kanjeng Ratu Kidul")
  })

  it("returns display name for librarian", () => {
    // given config key "librarian"
    const configKey = "pujangga"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "librarian"
    expect(result).toBe("Ki Pujangga")
  })

  it("returns display name for explore", () => {
    // given config key "explore"
    const configKey = "nayagenggong"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "explore"
    expect(result).toBe("Nayagenggong")
  })

  it("returns display name for multimodal-looker", () => {
    // given config key "multimodal-looker"
    const configKey = "surya"

    // when getAgentDisplayName called
    const result = getAgentDisplayName(configKey)

    // then returns "multimodal-looker"
    expect(result).toBe("Batara Surya")
  })
})

describe("getAgentConfigKey", () => {
  it("resolves display name to config key", () => {
    // given display name "Sisyphus - Ultraworker"
    // when getAgentConfigKey called
    // then returns "ismaya"
    expect(getAgentConfigKey("Sang Hyang Ismaya")).toBe("ismaya")
  })

  it("resolves display name case-insensitively", () => {
    // given display name in different case
    // when getAgentConfigKey called
    // then returns "aji-saka"
    expect(getAgentConfigKey("aji saka")).toBe("aji-saka")
  })

  it("resolves legacy parenthesized display names", () => {
    // given legacy parenthesized display name from old configs/sessions
    // when getAgentConfigKey called
    // then resolves to canonical config key
    expect(getAgentConfigKey("Sisyphus (Ultraworker)")).toBe("ismaya")
    expect(getAgentConfigKey("Atlas (Plan Executor)")).toBe("aji-saka")
  })

  it("canonicalizes legacy lowercase config keys", () => {
    // given lowercase legacy config key "prometheus"
    // when getAgentConfigKey called
    // then returns canonical config key "dewi-sri"
    expect(getAgentConfigKey("dewi-sri")).toBe("dewi-sri")
  })

  it("returns lowercased unknown agents", () => {
    // given unknown agent name
    // when getAgentConfigKey called
    // then returns lowercased
    expect(getAgentConfigKey("Custom-Agent")).toBe("custom-agent")
  })

  it("resolves all core agent display names", () => {
    // given all core display names
    // when/then each resolves to its config key
    expect(getAgentConfigKey("Togog")).toBe("togog")
    expect(getAgentConfigKey("Dewi Sri")).toBe("dewi-sri")
    expect(getAgentConfigKey("Aji Saka")).toBe("aji-saka")
    expect(getAgentConfigKey("Jayabaya")).toBe("jayabaya")
    expect(getAgentConfigKey("Sabdapalon")).toBe("sabdapalon")
    expect(getAgentConfigKey("Cenil")).toBe("cenil")
  })

  it("resolves atlas even when the UI ordering prefix is present", () => {
    expect(getAgentConfigKey(getAgentListDisplayName("aji-saka"))).toBe("aji-saka")
  })
})

describe("getAgentListDisplayName", () => {
  it("applies invisible stable-sort prefixes to the core agent list", () => {
    expect(getAgentListDisplayName("ismaya")).toBe("\u200BSang Hyang Ismaya")
    expect(getAgentListDisplayName("togog")).toBe("\u200B\u200BTogog")
    expect(getAgentListDisplayName("dewi-sri")).toBe("\u200B\u200B\u200BDewi Sri")
    expect(getAgentListDisplayName("aji-saka")).toBe("\u200B\u200B\u200B\u200BAji Saka")
  })

  it("keeps non-core agents unprefixed for list display", () => {
    expect(getAgentListDisplayName("ratu-kidul")).toBe("Kanjeng Ratu Kidul")
  })
})

describe("normalizeAgentForPrompt", () => {
  it("strips core UI ordering prefixes back to canonical display names", () => {
    expect(normalizeAgentForPrompt(getAgentListDisplayName("ismaya"))).toBe("Sang Hyang Ismaya")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("togog"))).toBe("Togog")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("dewi-sri"))).toBe("Dewi Sri")
    expect(normalizeAgentForPrompt(getAgentListDisplayName("aji-saka"))).toBe("Aji Saka")
  })
})

describe("normalizeAgentForPromptKey", () => {
  it("converts canonical display names to canonical config keys", () => {
    expect(normalizeAgentForPromptKey("Aji Saka")).toBe("aji-saka")
    expect(normalizeAgentForPromptKey("Sang Hyang Ismaya")).toBe("ismaya")
    expect(normalizeAgentForPromptKey("Kanjeng Ratu Kidul")).toBe("ratu-kidul")
  })

  it("preserves custom agents", () => {
    expect(normalizeAgentForPromptKey("MyCustomAgent")).toBe("MyCustomAgent")
  })
})

describe("AGENT_DISPLAY_NAMES", () => {
  it("contains all expected agent mappings", () => {
    // given expected mappings
    const expectedMappings = {
      sisyphus: "Sang Hyang Ismaya",
      hephaestus: "Togog",
      prometheus: "Dewi Sri",
      atlas: "Aji Saka",
      "sisyphus-junior": "Cenil",
      metis: "Jayabaya",
      momus: "Sabdapalon",
      athena: "Athena - Council",
      "athena-junior": "Athena-Junior - Council",
      oracle: "Kanjeng Ratu Kidul",
      librarian: "Ki Pujangga",
      explore: "Nayagenggong",
      "multimodal-looker": "Batara Surya",
      ismaya: "Sang Hyang Ismaya",
      togog: "Togog",
      "dewi-sri": "Dewi Sri",
      "aji-saka": "Aji Saka",
      cenil: "Cenil",
      jayabaya: "Jayabaya",
      sabdapalon: "Sabdapalon",
      "ratu-kidul": "Kanjeng Ratu Kidul",
      pujangga: "Ki Pujangga",
      nayagenggong: "Nayagenggong",
      surya: "Batara Surya",
      "council-member": "council-member",
    }

    // when checking the constant
    // then contains all expected mappings
    expect(AGENT_DISPLAY_NAMES).toEqual(expectedMappings)
  })

  it("all display names must be HTTP-header-safe (no parentheses)", () => {
    // given all agent display names
    const httpHeaderUnsafe = /[()]/

    // when checking each display name
    for (const [key, displayName] of Object.entries(AGENT_DISPLAY_NAMES)) {
      // then none should contain parentheses
      expect(httpHeaderUnsafe.test(displayName)).toBe(false)
    }
  })
})
