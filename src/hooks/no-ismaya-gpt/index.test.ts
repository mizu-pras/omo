import { describe, expect, spyOn, test } from "bun:test"
import { _resetForTesting, updateSessionAgent } from "../../features/claude-code-session-state"
import { getAgentDisplayName } from "../../shared/agent-display-names"
import { createNoIsmayaGptHook as createNoSisyphusGptHook } from "./index"

const ISMAYA_DISPLAY = getAgentDisplayName("ismaya")
const TOGOG_DISPLAY = getAgentDisplayName("togog")

function createOutput() {
  return {
    message: {} as { agent?: string; [key: string]: unknown },
    parts: [],
  }
}

describe("no-ismaya-gpt hook", () => {
  test("shows toast on every chat.message when sisyphus uses gpt model", async () => {
    // given - ismaya with gpt model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoSisyphusGptHook({
      client: { tui: { showToast } },
    } as any)

    const output1 = createOutput()
    const output2 = createOutput()

    // when - chat.message is called repeatedly with canonical agent key
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: "ismaya",
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output1)
    await hook["chat.message"]?.({
      sessionID: "ses_1",
      agent: "ismaya",
      model: { providerID: "openai", modelID: "gpt-5.3-codex" },
    }, output2)

    // then - toast is shown for every message
    expect(showToast).toHaveBeenCalledTimes(2)
    expect(output1.message.agent).toBe("togog")
    expect(output2.message.agent).toBe("togog")
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      body: {
        title: "NEVER Use Ismaya with GPT",
        message: expect.stringContaining("For GPT models (other than 5.4), always use Togog."),
        variant: "error",
      },
    })
  })

  test("does not show toast for gpt-5.4 model (Sisyphus has specialized support)", async () => {
    // given - ismaya with gpt-5.4 model (should be allowed)
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoSisyphusGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs with gpt-5.4
    await hook["chat.message"]?.({
      sessionID: "ses_gpt54",
      agent: ISMAYA_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast, agent NOT switched to Hephaestus
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-gpt model", async () => {
    // given - ismaya with claude model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoSisyphusGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_2",
      agent: ISMAYA_DISPLAY,
      model: { providerID: "anthropic", modelID: "claude-opus-4-6" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("does not show toast for non-sisyphus agent", async () => {
    // given - togog with gpt model
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoSisyphusGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs
    await hook["chat.message"]?.({
      sessionID: "ses_3",
      agent: TOGOG_DISPLAY,
      model: { providerID: "openai", modelID: "gpt-5.4" },
    }, output)

    // then - no toast
    expect(showToast).toHaveBeenCalledTimes(0)
    expect(output.message.agent).toBeUndefined()
  })

  test("uses session agent fallback when input agent is missing", async () => {
    // given - session agent saved as canonical key
    _resetForTesting()
    updateSessionAgent("ses_4", "ismaya")
    const showToast = spyOn({ fn: async () => ({}) }, "fn")
    const hook = createNoSisyphusGptHook({
      client: { tui: { showToast } },
    } as any)

    const output = createOutput()

    // when - chat.message runs without input.agent
    await hook["chat.message"]?.({
      sessionID: "ses_4",
      model: { providerID: "openai", modelID: "gpt-4o" },
    }, output)

    // then - toast shown via session-agent fallback
    expect(showToast).toHaveBeenCalledTimes(1)
    expect(output.message.agent).toBe("togog")
  })
})
