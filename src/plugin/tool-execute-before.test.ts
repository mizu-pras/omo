const { mkdtempSync, rmSync } = require("node:fs")
const { tmpdir } = require("node:os")
const { join } = require("node:path")
const { afterEach, describe, expect, test } = require("bun:test")
const { createToolExecuteBeforeHandler } = require("./tool-execute-before")
const { createToolRegistry } = require("./tool-registry")
const { builtinTools } = require("../tools")
const { resetStorageClient } = require("../tools/session-manager/storage")
const { writeState } = require("../hooks/ralph-loop/storage")

describe("createToolExecuteBeforeHandler", () => {
  test("does not execute subagent question blocker hook for question tool", async () => {
    //#given
    const ctx = {
      client: {
        session: {
          messages: async () => ({ data: [] }),
        },
      },
    }

    const hooks = {
      subagentQuestionBlocker: {
        "tool.execute.before": async () => {
          throw new Error("subagentQuestionBlocker should not run")
        },
      },
    }

    const handler = createToolExecuteBeforeHandler({ ctx, hooks })
    const input = { tool: "question", sessionID: "ses_sub", callID: "call_1" }
    const output = { args: { questions: [] } as Record<string, unknown> }

    //#when
    const run = handler(input, output)

    //#then
    await expect(run).resolves.toBeUndefined()
  })

  test("triggers session notification hook for question tools", async () => {
    let called = false
    const ctx = {
      client: {
        session: {
          messages: async () => ({ data: [] }),
        },
      },
    }

    const hooks = {
      sessionNotification: async (input: { event: { type: string; properties?: Record<string, unknown> } }) => {
        called = true
        expect(input.event.type).toBe("tool.execute.before")
        expect(input.event.properties?.sessionID).toBe("ses_q")
        expect(input.event.properties?.tool).toBe("question")
      },
    }

    const handler = createToolExecuteBeforeHandler({ ctx, hooks })
    const input = { tool: "question", sessionID: "ses_q", callID: "call_q" }
    const output = { args: { questions: [{ question: "Proceed?", options: [{ label: "Yes" }] }] } as Record<string, unknown> }

    await handler(input, output)

    expect(called).toBe(true)
  })

  test("does not trigger session notification hook for non-question tools", async () => {
    let called = false
    const ctx = {
      client: {
        session: {
          messages: async () => ({ data: [] }),
        },
      },
    }

    const hooks = {
      sessionNotification: async () => {
        called = true
      },
    }

    const handler = createToolExecuteBeforeHandler({ ctx, hooks })

    await handler(
      { tool: "bash", sessionID: "ses_b", callID: "call_b" },
      { args: { command: "pwd" } as Record<string, unknown> },
    )

    expect(called).toBe(false)
  })

  describe("task tool subagent_type normalization", () => {
    const emptyHooks = {}

    function createCtxWithSessionMessages(messages: Array<{ info?: { agent?: string; role?: string } }> = []) {
      return {
        client: {
          session: {
            messages: async () => ({ data: messages }),
          },
        },
      }
    }

    test("sets subagent_type to cenil when category is provided without subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { category: "quick", description: "Test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("cenil")
    })

    test("preserves existing subagent_type when explicitly provided", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { subagent_type: "plan", description: "Plan test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("plan")
    })

    test("sets subagent_type to cenil when category provided with different subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { category: "quick", subagent_type: "ratu-kidul", description: "Test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("cenil")
    })

    test("resolves subagent_type from session first message when session_id provided without subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages([
        { info: { role: "user" } },
        { info: { role: "assistant", agent: "nayagenggong" } },
        { info: { role: "assistant", agent: "ratu-kidul" } },
      ])
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", description: "Continue task", prompt: "fix it" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("Nayagenggong")
    })

    test("falls back to 'continue' when session has no agent info", async () => {
      //#given
      const ctx = createCtxWithSessionMessages([
        { info: { role: "user" } },
        { info: { role: "assistant" } },
      ])
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", description: "Continue task", prompt: "fix it" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("continue")
    })

    test("preserves subagent_type when session_id is provided with explicit subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", subagent_type: "nayagenggong", description: "Continue explore" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("nayagenggong")
    })

    test("does not modify args for non-task tools", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "bash", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { command: "ls" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBeUndefined()
    })

    test("does not set subagent_type when neither category nor session_id is provided and subagent_type is present", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { subagent_type: "ratu-kidul", description: "Oracle task" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("ratu-kidul")
    })

    test("injects ULW oracle verification for legacy oracle subagent_type", async () => {
      //#given
      const directory = mkdtempSync(join(tmpdir(), "tool-execute-before-"))

      try {
        const ctx = {
          directory,
          client: {
            session: {
              messages: async () => ({ data: [] }),
            },
          },
        }
        writeState(directory, {
          active: true,
          iteration: 1,
          completion_promise: "<promise>DONE</promise>",
          started_at: new Date().toISOString(),
          prompt: "Finish the ULW task",
          session_id: "ses_ulw",
          ultrawork: true,
          verification_pending: true,
        })
        const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
        const input = { tool: "task", sessionID: "ses_ulw", callID: "call_ulw" }
        const output = {
          args: { subagent_type: "ratu-kidul", prompt: "Review the result" } as Record<string, unknown>,
        }

        //#when
        await handler(input, output)

        //#then
        expect(output.args.run_in_background).toBe(false)
        expect(typeof output.args.prompt).toBe("string")
        expect(output.args.prompt).toContain("You are verifying the active ULTRAWORK loop result for this session.")
        expect(output.args.prompt).toContain("Finish the ULW task")
      } finally {
        rmSync(directory, { recursive: true, force: true })
      }
    })
  })
})

describe("createToolRegistry", () => {
  afterEach(() => {
    resetStorageClient()
  })

  function createRegistryInput(overrides = {}) {
    return {
      ctx: {
        directory: process.cwd(),
        client: {
          session: {
            messages: async () => ({ data: [] }),
          },
        },
      },
      pluginConfig: {
        ...overrides,
      },
      managers: {
        backgroundManager: {},
        tmuxSessionManager: {},
        skillMcpManager: {},
      },
      skillContext: {
        mergedSkills: [],
        availableSkills: [],
        browserProvider: "playwright",
        disabledSkills: new Set(),
      },
      availableCategories: [],
    }
  }

  describe("#given hashline_edit is undefined", () => {
    describe("#when creating tool registry", () => {
      test("#then should not register edit tool", () => {
        const result = createToolRegistry(createRegistryInput())

        expect(result.filteredTools.edit).toBeUndefined()
      })
    })
  })

  describe("#given hashline_edit is true", () => {
    describe("#when creating tool registry", () => {
      test("#then should register edit tool", () => {
        const result = createToolRegistry(
          createRegistryInput({
            hashline_edit: true,
          }),
        )

        expect(result.filteredTools.edit).toBeDefined()
      })
    })
  })

  describe("#given max_tools is lower than or equal to builtin tool count", () => {
    describe("#when creating the tool registry", () => {
      test("#then it trims to the exact configured cap", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: Object.keys(builtinTools).length },
          }),
        )

        expect(Object.keys(result.filteredTools)).toHaveLength(Object.keys(builtinTools).length)
      })
    })
  })

  describe("#given max_tools is set below the full plugin tool count", () => {
    describe("#when creating the tool registry", () => {
      test("#then it enforces the exact cap deterministically", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: 10 },
          }),
        )

        expect(Object.keys(result.filteredTools)).toHaveLength(10)
      })

      test("#then it keeps the task tool when lower-priority tools can satisfy the cap", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: 10 },
          }),
        )

        expect(result.filteredTools.task).toBeDefined()
      })
    })
  })
})

export {}
