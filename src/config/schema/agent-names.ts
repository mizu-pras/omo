import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "ismaya",
  "togog",
  "dewi-sri",
  "ratu-kidul",
  "pujangga",
  "nayagenggong",
  "surya",
  "jayabaya",
  "sabdapalon",
  "aji-saka",
  "cenil",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend-ui-ux",
  "git-master",
  "review-work",
  "ai-slop-remover",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "ismaya",
  "togog",
  "cenil",
  "OpenCode-Builder",
  "dewi-sri",
  "jayabaya",
  "sabdapalon",
  "ratu-kidul",
  "pujangga",
  "nayagenggong",
  "surya",
  "aji-saka",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
