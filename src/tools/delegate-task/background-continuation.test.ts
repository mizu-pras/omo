import { describe, test, expect, mock } from "bun:test"

describe("executeBackgroundContinuation - subagent metadata", () => {
  test("canonicalizes legacy oracle agent in task_metadata", async () => {
    //#given - mock manager.resume returning legacy oracle agent
    const mockManager = {
      resume: async () => ({
        id: "bg_task_001",
        description: "oracle consultation",
        agent: "ratu-kidul",
        status: "running",
        sessionID: "ses_resumed_123",
      }),
    }

    const mockCtx = {
      sessionID: "parent-session",
      callID: "call-456",
      metadata: mock(() => Promise.resolve()),
    }

    const mockExecutorCtx = {
      manager: mockManager,
    }

    const parentContext = {
      sessionID: "parent-session",
      messageID: "msg-parent",
      agent: "ismaya",
    }

    const args = {
      session_id: "ses_resumed_123",
      prompt: "continue working",
      description: "resume oracle",
      load_skills: [],
      run_in_background: true,
    }

    //#when - executeBackgroundContinuation completes
    const { executeBackgroundContinuation } = require("./background-continuation")
    const result = await executeBackgroundContinuation(args, mockCtx, mockExecutorCtx, parentContext)

    //#then - task_metadata should contain canonical subagent field
    expect(result).toContain("<task_metadata>")
    expect(result).toContain("subagent: ratu-kidul")
    expect(result).toContain("Agent: ratu-kidul")
    expect(result).toContain("session_id: ses_resumed_123")
  })

  test("canonicalizes legacy prometheus agent in task_metadata", async () => {
    //#given - mock manager.resume returning legacy prometheus agent
    const mockManager = {
      resume: async () => ({
        id: "bg_task_003",
        description: "plan builder",
        agent: "dewi-sri",
        status: "running",
        sessionID: "ses_resumed_789",
      }),
    }

    const mockCtx = {
      sessionID: "parent-session",
      callID: "call-999",
      metadata: mock(() => Promise.resolve()),
    }

    const mockExecutorCtx = {
      manager: mockManager,
    }

    const parentContext = {
      sessionID: "parent-session",
      messageID: "msg-parent",
      agent: "ismaya",
    }

    const args = {
      session_id: "ses_resumed_789",
      prompt: "continue planning",
      description: "resume plan builder",
      load_skills: [],
      run_in_background: true,
    }

    //#when - executeBackgroundContinuation completes
    const { executeBackgroundContinuation } = require("./background-continuation")
    const result = await executeBackgroundContinuation(args, mockCtx, mockExecutorCtx, parentContext)

    //#then - task_metadata should contain canonical plan-family subagent field
    expect(result).toContain("subagent: dewi-sri")
    expect(result).toContain("Agent: dewi-sri")
    expect(result).toContain("session_id: ses_resumed_789")
  })

  test("omits subagent from task_metadata when task agent is undefined", async () => {
    //#given - mock manager.resume returning task without agent
    const mockManager = {
      resume: async () => ({
        id: "bg_task_002",
        description: "unknown task",
        agent: undefined,
        status: "running",
        sessionID: "ses_resumed_456",
      }),
    }

    const mockCtx = {
      sessionID: "parent-session",
      callID: "call-789",
      metadata: mock(() => Promise.resolve()),
    }

    const mockExecutorCtx = {
      manager: mockManager,
    }

    const parentContext = {
      sessionID: "parent-session",
      messageID: "msg-parent",
      agent: "ismaya",
    }

    const args = {
      session_id: "ses_resumed_456",
      prompt: "continue",
      description: "resume task",
      load_skills: [],
      run_in_background: true,
    }

    //#when - executeBackgroundContinuation completes without agent
    const { executeBackgroundContinuation } = require("./background-continuation")
    const result = await executeBackgroundContinuation(args, mockCtx, mockExecutorCtx, parentContext)

    //#then - task_metadata should NOT contain subagent field
    expect(result).toContain("<task_metadata>")
    expect(result).toContain("session_id: ses_resumed_456")
    expect(result).not.toContain("subagent:")
  })
})
