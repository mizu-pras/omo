export const ALLOWED_AGENTS = [
  "nayagenggong",
  "pujangga",
  "ratu-kidul",
  "togog",
  "jayabaya",
  "sabdapalon",
  "surya",
] as const

export const CALL_OMO_AGENT_DESCRIPTION = `Spawn nayagenggong/pujangga agent. run_in_background REQUIRED (true=async with task_id, false=sync).

Available: {agents}

Pass \`session_id=<id>\` to continue previous agent with full context. Nested subagent depth is tracked automatically and blocked past the configured limit. Prompts MUST be in English. Use \`background_output\` for async results.`
