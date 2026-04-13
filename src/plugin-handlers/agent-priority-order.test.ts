import { describe, expect, test } from "bun:test"

import { reorderAgentsByPriority } from "./agent-priority-order"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("reorderAgentsByPriority", () => {
  test("moves core agents to canonical order and injects runtime order fields", () => {
    // given
    const sisyphus = getAgentListDisplayName("ismaya")
    const hephaestus = getAgentListDisplayName("togog")
    const prometheus = getAgentListDisplayName("dewi-sri")
    const atlas = getAgentListDisplayName("aji-saka")
    const oracle = getAgentDisplayName("ratu-kidul")

    const agents: Record<string, unknown> = {
      [oracle]: { name: "ratu-kidul", mode: "subagent" },
      [atlas]: { name: "aji-saka", mode: "primary" },
      [prometheus]: { name: "dewi-sri", mode: "all" },
      [hephaestus]: { name: "togog", mode: "primary" },
      [sisyphus]: { name: "ismaya", mode: "primary" },
    }

    // when
    const result = reorderAgentsByPriority(agents)

    // then
    expect(Object.keys(result)).toEqual([
      sisyphus,
      hephaestus,
      prometheus,
      atlas,
      oracle,
    ])
    expect(result[sisyphus]).toEqual({
      name: "ismaya",
      mode: "primary",
      order: 1,
    })
    expect(result[hephaestus]).toEqual({
      name: "togog",
      mode: "primary",
      order: 2,
    })
    expect(result[prometheus]).toEqual({
      name: "dewi-sri",
      mode: "all",
      order: 3,
    })
    expect(result[atlas]).toEqual({
      name: "aji-saka",
      mode: "primary",
      order: 4,
    })
    expect(result[oracle]).toEqual({
      name: "ratu-kidul",
      mode: "subagent",
    })
  })

  test("leaves non-object agent configs untouched while still reordering keys", () => {
    // given
    const sisyphus = getAgentListDisplayName("ismaya")
    const atlas = getAgentListDisplayName("aji-saka")

    const agents: Record<string, unknown> = {
      [atlas]: "atlas-config",
      custom: "custom-config",
      [sisyphus]: "sisyphus-config",
    }

    // when
    const result = reorderAgentsByPriority(agents)

    // then
    expect(Object.keys(result)).toEqual([sisyphus, atlas, "custom"])
    expect(result[sisyphus]).toBe("sisyphus-config")
    expect(result[atlas]).toBe("atlas-config")
    expect(result.custom).toBe("custom-config")
  })
})
