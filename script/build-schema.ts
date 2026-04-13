#!/usr/bin/env bun
import { createParaHyangJsonSchema } from "./build-schema-document"

const SCHEMA_OUTPUT_PATH = "assets/para-hyang.schema.json"
const DIST_SCHEMA_OUTPUT_PATH = "dist/para-hyang.schema.json"

async function main() {
  console.log("Generating JSON Schema...")

  const finalSchema = createParaHyangJsonSchema()
  await Bun.write(SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))
  await Bun.write(DIST_SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))

  console.log(`✓ JSON Schema generated: ${SCHEMA_OUTPUT_PATH}`)
}

main()
