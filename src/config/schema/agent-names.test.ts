import { describe, expect, test } from "bun:test"
import { ParaHyangConfigSchema } from "./para-hyang-config"

describe("ParaHyangConfigSchema disabled_skills", () => {
  test("accepts review-work and ai-slop-remover", () => {
    // given
    const config = {
      disabled_skills: ["review-work", "ai-slop-remover"],
    }

    // when
    const result = ParaHyangConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disabled_skills).toEqual([
        "review-work",
        "ai-slop-remover",
      ])
    }
  })
})
