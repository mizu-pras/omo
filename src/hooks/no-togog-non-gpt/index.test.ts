/// <reference types="bun-types" />

import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoTogogNonGptHook as createNoHephaestusNonGptHook } from "./index"

const TOGOG_DISPLAY = getAgentDisplayName("togog")
const ISMAYA_DISPLAY = getAgentDisplayName("ismaya")

function createOutput() {
  return {
    message: {} as { agent?: string; [key: string]: unknown },
    parts: [],
  }
}

describe("no-togog-non-gpt hook", () => {
  test("shows toast on every chat.message when hephaestus uses non-gpt model", async () => {
    // given - togog with claude model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoHephaestusNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: TOGOG_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: TOGOG_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output2)

    // then - toast is shown and agent is switched to sisyphus
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("ismaya")
    expect(output2.message.agent).toBe("ismaya")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Togog with Non-GPT",
        message: expect.stringContaining("Togog is trash without GPT."),
        variant: "error",
      },
    })
  })

  test("shows warning and does not switch agent when allow_non_gpt_model is enabled", async () => {
    // given - togog with claude model and opt-out enabled
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoHephaestusNonGptHook({
      client: { tui: { showToast } },
    } as any, {
      allowNonGptModel: true,
    })

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_opt_out",
      agent: TOGOG_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - warning toast is shown but agent is not switched
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBeUndefined()
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Togog with Non-GPT",
        variant: "warning",
      },
    })
  })

  test("does not show toast when hephaestus uses gpt model", async () => {
    // given - togog with gpt model
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoHephaestusNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: TOGOG_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output)

    // then - no toast, agent unchanged
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-hephaestus agent", async () => {
    // given - ismaya with claude model (non-gpt)
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoHephaestusNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: ISMAYA_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved as canonical key
    _resetForTesting()
    updateSessionAgent("ses_4", "togog")
    const showToast = spyOn({ fn: async (_input: unknown) => ({}) }, "fn")
    const hook = createNoHephaestusNonGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - toast shown via session-agent fallback, switched to sisyphus
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("ismaya")
  })
})
