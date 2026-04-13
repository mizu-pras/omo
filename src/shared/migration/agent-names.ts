export const AGENT_NAME_MAP: Record<string, string> = {
  // Sisyphus variants → "ismaya"
  omo: "ismaya",
  OmO: "ismaya",
  Sisyphus: "ismaya",
  sisyphus: "ismaya",
  SISYPHUS: "ismaya",
  "Sisyphus - Ultraworker": "ismaya",
  "sisyphus - ultraworker": "ismaya",

  // Prometheus variants → "dewi-sri"
  "OmO-Plan": "dewi-sri",
  "omo-plan": "dewi-sri",
  "Planner-Sisyphus": "dewi-sri",
  "planner-sisyphus": "dewi-sri",
  "Prometheus - Plan Builder": "dewi-sri",
  prometheus: "dewi-sri",
  Prometheus: "dewi-sri",

  // Atlas variants → "aji-saka"
  "orchestrator-sisyphus": "aji-saka",
  Atlas: "aji-saka",
  atlas: "aji-saka",
  "Atlas - Plan Executor": "aji-saka",
  "atlas - plan executor": "aji-saka",

  // Metis variants → "jayabaya"
  "plan-consultant": "jayabaya",
  "Metis - Plan Consultant": "jayabaya",
  metis: "jayabaya",
  Metis: "jayabaya",

  // Momus variants → "sabdapalon"
  "Momus - Plan Critic": "sabdapalon",
  momus: "sabdapalon",
  Momus: "sabdapalon",

  // Sisyphus-Junior → "cenil"
  "Sisyphus-Junior": "cenil",
  "sisyphus-junior": "cenil",
  "sisyphus_junior": "cenil",
  SisyphusJunior: "cenil",

  // Hephaestus variants → "togog"
  Hephaestus: "togog",
  hephaestus: "togog",

  // Oracle variants → "ratu-kidul"
  Oracle: "ratu-kidul",
  oracle: "ratu-kidul",

  // Librarian variants → "pujangga"
  Librarian: "pujangga",
  librarian: "pujangga",

  // Explore variants → "nayagenggong"
  Explore: "nayagenggong",
  explore: "nayagenggong",

  // Multimodal-Looker variants → "surya"
  "Multimodal-Looker": "surya",
  "multimodal-looker": "surya",
  "multimodal_looker": "surya",
  MultimodalLooker: "surya",

  // Passthrough
  build: "build",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "ismaya", // was "Sisyphus"
  "ratu-kidul", // was "oracle"
  "pujangga", // was "librarian"
  "nayagenggong", // was "explore"
  "surya", // was "multimodal-looker"
  "jayabaya", // was "Metis - Plan Consultant"
  "sabdapalon", // was "Momus - Plan Critic"
  "dewi-sri", // was "Prometheus - Plan Builder"
  "aji-saka", // was "Atlas"
  "togog", // was "Hephaestus"
  "cenil", // was "Sisyphus-Junior"
  "build",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
