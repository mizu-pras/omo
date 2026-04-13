import { describe, expect, test } from "bun:test"
import { injectContinuationPrompt } from "./continuation-prompt-injector"

describe("ralph-loop continuation prompt injector", () => {
  test("#given inherited Dewi Sri display name #when injecting continuation prompt #then promptAsync receives the canonical current agent", async () => {
    // given
    let promptBody:
      | {
          agent?: string
        }
      | undefined
    const ctx = {
      client: {
        session: {
          messages: async () => ({
            data: [{ info: { agent: "Dewi Sri" } }],
          }),
          promptAsync: async (input: { body: { agent?: string } }) => {
            promptBody = input.body
            return {}
          },
        },
      },
    }

    // when
    await injectContinuationPrompt(ctx as never, {
      sessionID: "ses_ralph_dewi_sri",
      prompt: "continue",
      directory: "/tmp/test",
      apiTimeoutMs: 50,
    })

    // then
    expect(promptBody?.agent).toBe("dewi-sri")
  })

  test("#given inherited Prometheus display name #when injecting continuation prompt #then promptAsync receives the canonical current agent", async () => {
    // given
    let promptBody:
      | {
          agent?: string
        }
      | undefined
    const ctx = {
      client: {
        session: {
          messages: async () => ({
            data: [{ info: { agent: "Prometheus" } }],
          }),
          promptAsync: async (input: { body: { agent?: string } }) => {
            promptBody = input.body
            return {}
          },
        },
      },
    }

    // when
    await injectContinuationPrompt(ctx as never, {
      sessionID: "ses_ralph_prometheus",
      prompt: "continue",
      directory: "/tmp/test",
      apiTimeoutMs: 50,
    })

    // then
    expect(promptBody?.agent).toBe("dewi-sri")
  })

  test("#given inherited message model includes variant #when injecting continuation prompt #then promptAsync receives variant as a top-level field", async () => {
    // given
    let promptBody:
      | {
          agent?: string
          model?: { providerID: string; modelID: string }
          variant?: string
        }
      | undefined
    const model = {
      providerID: "openai",
      modelID: "gpt-5.3-codex",
      variant: "max",
    }
    const ctx = {
      client: {
        session: {
          messages: async () => ({
            data: [{ info: { agent: "ismaya", model } }],
          }),
          promptAsync: async (input: {
            body: {
              agent?: string
              model?: { providerID: string; modelID: string }
              variant?: string
            }
          }) => {
            promptBody = input.body
            return {}
          },
        },
      },
    }

    // when
    await injectContinuationPrompt(ctx as never, {
      sessionID: "ses_ralph_variant",
      prompt: "continue",
      directory: "/tmp/test",
      apiTimeoutMs: 50,
    })

    // then
    expect(promptBody?.model).toEqual({
      providerID: "openai",
      modelID: "gpt-5.3-codex",
    })
    expect(promptBody?.variant).toBe("max")
  })
})
