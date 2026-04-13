import { z } from "zod"
import { ParaHyangConfigSchema } from "../src/config/schema/para-hyang-config"

export function createParaHyangJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(ParaHyangConfigSchema, {
    target: "draft-7",
    unrepresentable: "any",
  }) as Record<string, unknown>

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/mizu-pras/omo/dev/assets/para-hyang.schema.json",
    title: "Para Hyang Configuration",
    description: "Configuration schema for para-hyang plugin",
    ...jsonSchema,
  }
}

export function createOhMyOpenCodeJsonSchema(): Record<string, unknown> {
	return createParaHyangJsonSchema()
}
