import { describe, it, expect } from "bun:test"
import { remapAgentKeysToDisplayNames } from "./agent-key-remapper"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("remapAgentKeysToDisplayNames", () => {
  it("remaps known agent keys to display names", () => {
    // given agents with lowercase keys
    const agents = {
      ismaya: { prompt: "test", mode: "primary" },
      "ratu-kidul": { prompt: "test", mode: "subagent" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then known agents get display name keys only
    expect(result[getAgentListDisplayName("ismaya")]).toBeDefined()
    expect(result[getAgentDisplayName("ratu-kidul")]).toBeDefined()
    expect(result["ismaya"]).toBeUndefined()
  })

  it("preserves unknown agent keys unchanged", () => {
    // given agents with a custom key
    const agents = {
      "custom-agent": { prompt: "custom" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then custom key is unchanged
    expect(result["custom-agent"]).toBeDefined()
  })

  it("remaps all core agents to display names", () => {
    // given all core agents
    const agents = {
      ismaya: {},
      togog: {},
      "dewi-sri": {},
      "aji-saka": {},
      athena: {},
      jayabaya: {},
      sabdapalon: {},
      cenil: {},
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then all get display name keys
    expect(result[getAgentListDisplayName("ismaya")]).toBeDefined()
    expect(result["ismaya"]).toBeUndefined()
    expect(result[getAgentListDisplayName("togog")]).toBeDefined()
    expect(result["togog"]).toBeUndefined()
    expect(result[getAgentListDisplayName("dewi-sri")]).toBeDefined()
    expect(result["dewi-sri"]).toBeUndefined()
    expect(result[getAgentListDisplayName("aji-saka")]).toBeDefined()
    expect(result["aji-saka"]).toBeUndefined()
    expect(result[getAgentDisplayName("athena")]).toBeDefined()
    expect(result["athena"]).toBeUndefined()
    expect(result[getAgentDisplayName("jayabaya")]).toBeDefined()
    expect(result["jayabaya"]).toBeUndefined()
    expect(result[getAgentDisplayName("sabdapalon")]).toBeDefined()
    expect(result["sabdapalon"]).toBeUndefined()
    expect(result[getAgentDisplayName("cenil")]).toBeDefined()
    expect(result["cenil"]).toBeUndefined()
  })

  it("does not emit both config and display keys for remapped agents", () => {
    // given one remapped agent
    const agents = {
      ismaya: { prompt: "test", mode: "primary" },
    }

    // when remapping
    const result = remapAgentKeysToDisplayNames(agents)

    // then only display key is emitted
    expect(Object.keys(result)).toEqual([getAgentListDisplayName("ismaya")])
    expect(result[getAgentListDisplayName("ismaya")]).toBeDefined()
    expect(result["ismaya"]).toBeUndefined()
  })

  it("keeps the four core agents in canonical order under opencode name sorting", () => {
    // given
    const result = remapAgentKeysToDisplayNames({
      "aji-saka": {},
      "dewi-sri": {},
      togog: {},
      ismaya: {},
    })

    // when
    const sortedNames = Object.keys(result).sort()

    // then
    expect(sortedNames).toEqual([
      getAgentListDisplayName("ismaya"),
      getAgentListDisplayName("togog"),
      getAgentListDisplayName("dewi-sri"),
      getAgentListDisplayName("aji-saka"),
    ])
  })
})
