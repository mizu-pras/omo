# Analisis Fork Lengkap: `code-yeongyu/oh-my-openagent`

> **Tanggal analisis:** 10 April 2026
> **Versi terakhir:** v3.16.0
> **Status:** Terverifikasi oleh Oracle (2x independent verification)

---

## Daftar Isi

1. [Identitas Repository](#1-identitas-repository)
2. [Hubungan oh-my-opencode vs oh-my-openagent](#2-hubungan-oh-my-opencode-vs-oh-my-openagent)
3. [Analisis Lisensi (KRITIS untuk Forking)](#3-analisis-lisensi-kritis-untuk-forking)
4. [Arsitektur Source Code](#4-arsitektur-source-code)
5. [Inventarisasi Rename (Blokir Forking)](#5-inventarisasi-rename-blokir-forking)
6. [Kunci Identitas Plugin](#6-kunci-identitas-plugin)
7. [Dependensi & Ketergantungan Eksternal](#7-dependensi--ketergantungan-eksternal)
8. [Pipeline Build (Detail Langkah)](#8-pipeline-build-detail-langkah)
9. [Infrastruktur Test](#9-infrastruktur-test)
10. [Pipeline CI/CD (Detail)](#10-pipeline-cicd-detail)
11. [Sistem Konfigurasi (Zod v4)](#11-sistem-konfigurasi-zod-v4)
12. [Sistem Agent (11 Agent)](#12-sistem-agent-11-agent)
13. [Sistem Hook (52 Hook)](#13-sistem-hook-52-hook)
14. [Sistem Tool (26 Tool)](#14-sistem-tool-26-tool)
15. [Integrasi MCP](#15-integrasi-mcp)
16. [Integrasi OpenClaw (Discord/Telegram)](#16-integrasi-openclaw)
17. [Sistem Skill](#17-sistem-skill)
18. [Resolusi Model & Fallback](#18-resolusi-model--fallback)
19. [Binary Platform](#19-binary-platform)
20. [Kontributor & Aktivitas](#20-kontributor--aktivitas)
21. [Panduan Forking Langkah demi Langkah](#21-panduan-forking-langkah-demi-langkah)

---

## 1. Identitas Repository

| Field | Value |
|-------|-------|
| **Repository** | `code-yeongyu/oh-my-openagent` |
| **Deskripsi** | "omo; the best agent harness - previously oh-my-opencode" |
| **Lisensi** | SUL-1.0 (Sustainable Use License) |
| **Bahasa** | TypeScript (strict) |
| **Branch default** | `dev` |
| **Dibuat** | 3 Desember 2025 |
| **Terakhir di-push** | 10 April 2026 |
| **Stars** | 50,093 |
| **Forks** | 3,988 |
| **Open issues** | 467 |
| **Apakah fork?** | **TIDAK** (`parent: null`, `fork: false`) |
| **Ukuran** | ~55 MB |
| **Topics** | `ai`, `ai-agents`, `anthropic`, `chatgpt`, `claude`, `claude-code`, `cursor`, `gemini`, `openai`, `opencode`, `orchestration`, `tui`, `typescript` |

---

## 2. Hubungan oh-my-opencode vs oh-my-openagent

Ini **SATU repo yang sama** yang mempublikasikan **DUA paket npm**. Proyek sedang dalam masa transisi rename.

| | `oh-my-opencode` | `oh-my-openagent` |
|---|---|---|
| **npm pertama dipublish** | 4 Desember 2025 | 7 Maret 2026 |
| **Versi npm saat ini** | 3.16.0 | 3.16.0 |
| **Deskripsi** | Identik | Identik |
| **npm repository URL** | Keduanya mengarah ke `code-yeongyu/oh-my-openagent` | - |
| **Status** | Legacy name (masih aktif) | Nama kanonik baru |

**Kronologi:**
1. Proyek awalnya bernama `oh-my-opencode` (Des 2025)
2. Di-rename menjadi `oh-my-openagent` (GitHub repo di-rename, PR #2786 update docs)
3. Kedua nama dipublish secara bersamaan untuk backward compatibility
4. `package.json` masih menggunakan `"name": "oh-my-opencode"` - rename ke `oh-my-openagent` terjadi secara dinamis saat publish

---

## 3. Analisis Lisensi (KRITIS untuk Forking)

### SUL-1.0 - Sustainable Use License Version 1.0

**INI BUKAN OPEN SOURCE.** Ini adalah lisensi **source-available** dengan pembatasan komersial ketat.

### Batasan Utama:

| Batasan | Detail |
|---------|--------|
| **Penggunaan komersial** | HANYA untuk "your own internal business purposes" ATAU "non-commercial or personal use" |
| **Distribusi** | HANYA "free of charge for non-commercial purposes" |
| **Sub-licensing** | DILARANG |
| **Modification notice** | WAJIB menyertakan "prominent notice" bahwa Anda telah memodifikasi |
| **Copyright notice** | DILARANG menghapus/mengaburkan lisensi/copyright notice |
| **Trademark** | Penggunaan tunduk pada hukum yang berlaku |

### Implikasi untuk Forking:

- Anda **TIDAK BISA** mendistribusikan fork secara komersial
- Anda **TIDAK BISA** me-relicense fork dengan lisensi berbeda
- Anda **HARUS** menyertakan notice yang menyatakan Anda telah memodifikasi kode
- Anda **HARUS** mempertahankan semua SUL-1.0 copyright notice
- Untuk penggunaan komersial, Anda **HARUS** bernegosiasi lisensi terpisah dengan maintainer (`code-yeongyu`)
- Fork untuk penggunaan pribadi/non-komersial diperbolehkan

---

## 4. Arsitektur Source Code

```
oh-my-openagent/
├── src/                          # ~1600 TypeScript source files
│   ├── index.ts                  # Plugin entry point
│   ├── plugin-config.ts          # Multi-level JSONC config (Zod v4)
│   ├── plugin-interface.ts       # Plugin interface (10 hook handler)
│   ├── plugin-state.ts           # Global plugin state
│   ├── create-hooks.ts           # Hook composition (core + continuation + skill)
│   ├── create-managers.ts        # Managers (tmux, background, MCP, config)
│   ├── create-tools.ts           # Tool registry + skill context
│   ├── plugin-dispose.ts         # Plugin cleanup
│   │
│   ├── agents/                   # 11 agents
│   │   ├── builtin-agents.ts     # Agent registry (agentSources map)
│   │   ├── agent-builder.ts      # Agent config construction
│   │   ├── sisyphus/             # Primary orchestrator
│   │   ├── hephaestus/           # Batch code generator
│   │   ├── prometheus/           # Plan builder
│   │   ├── atlas/                # Multi-repo coordinator
│   │   ├── sisyphus-junior/      # Delegated task executor
│   │   ├── oracle.ts             # Read-only consultant (architecture, debugging)
│   │   ├── librarian.ts          # External reference grep
│   │   ├── explore.ts            # Internal codebase grep
│   │   ├── metis.ts              # Pre-planning consultant
│   │   ├── momus.ts              # Plan critic
│   │   └── multimodal-looker.ts  # Media analysis (PDF, images)
│   │
│   ├── hooks/                    # 52 lifecycle hooks
│   │   ├── index.ts              # Hook barrel export
│   │   ├── keyword-detector/     # Magic keyword detection (ultrawork, ralph, etc.)
│   │   ├── ralph-loop/           # Self-referential loop
│   │   ├── runtime-fallback/     # Reactive error recovery
│   │   ├── model-fallback/       # Proactive model fallback (chat.params)
│   │   ├── preemptive-compaction.ts  # Context window management
│   │   ├── hashline-edit-diff-enhancer/  # Edit with LINE#ID hashing
│   │   ├── hashline-read-enhancer/      # Read with content tags
│   │   ├── comment-checker/      # AI comment detection
│   │   ├── compaction-context-injector/ # Context injection on compact
│   │   ├── compaction-todo-preserver/   # Todo preservation on compact
│   │   ├── session-notification.ts      # Session notifications (Discord/Telegram)
│   │   ├── context-window-monitor.ts    # Token usage monitoring
│   │   ├── think-mode/           # Think mode control
│   │   ├── thinking-block-validator/    # Thinking block validation
│   │   ├── todo-continuation-enforcer/  # Auto todo continuation enforcement
│   │   ├── rules-injector/       # Project rules injection
│   │   ├── directory-agents-injector/   # Per-directory agent instructions
│   │   ├── directory-readme-injector/   # Per-directory README context
│   │   ├── agent-usage-reminder/        # Agent usage reminder
│   │   ├── category-skill-reminder/     # Category & skill reminder
│   │   ├── auto-slash-command/          # Auto command detection
│   │   ├── auto-update-checker/         # Auto update checker
│   │   ├── edit-error-recovery/         # Edit error recovery
│   │   ├── webfetch-redirect-guard/     # Webfetch redirect guard
│   │   ├── write-existing-file-guard/   # Existing file overwrite guard
│   │   └── ... (30+ hook modules)
│   │
│   ├── tools/                    # 26 tools across 16 directories
│   │   ├── delegate-task/        # Task delegation to Sisyphus-Junior
│   │   ├── hashline-edit/        # Content-hash verified file editing
│   │   ├── lsp/                  # Language Server Protocol tools
│   │   ├── ast-grep/             # AST-aware pattern matching
│   │   ├── background-task/      # Background task management
│   │   ├── session-manager/      # Session persistence & search
│   │   ├── skill-mcp/            # MCP invocation from skills
│   │   ├── skill/                # Skill loading & management
│   │   ├── slashcommand/         # Slash command execution
│   │   ├── interactive-bash/     # tmux-based interactive bash
│   │   ├── task/                 # Task spawning (delegate_task)
│   │   ├── call-omo-agent/       # Inter-agent communication
│   │   ├── glob/                 # Glob pattern file search
│   │   ├── grep/                 # Content search
│   │   ├── look-at/              # Media file inspection
│   │   └── shared/               # Cross-tool utilities
│   │
│   ├── features/                 # 19 feature modules
│   │   ├── background-agent/     # Background task execution (BackgroundManager)
│   │   ├── builtin-skills/       # Built-in skills (github-triage, etc.)
│   │   ├── builtin-commands/     # Built-in commands (publish, triage, etc.)
│   │   ├── skill-mcp-manager/    # Per-skill per-session MCP management
│   │   ├── tmux-subagent/        # tmux-based subagent execution
│   │   ├── claude-code-agent-loader/  # Claude Code agent config loader
│   │   ├── claude-code-command-loader/ # Claude Code command loader
│   │   ├── claude-code-mcp-loader/     # Claude Code MCP loader
│   │   ├── claude-code-plugin-loader/  # Claude Code plugin loader
│   │   ├── claude-code-session-state/  # Claude Code session state
│   │   ├── claude-tasks/         # Claude task management
│   │   ├── context-injector/     # Custom context injection
│   │   ├── hook-message-injector/ # Hook message injection
│   │   ├── mcp-oauth/            # OAuth flow for MCP servers
│   │   ├── opencode-skill-loader/ # OpenCode skill loader
│   │   ├── run-continuation-state/ # Run continuation state
│   │   ├── task-toast-manager/   # Task UI feedback
│   │   ├── tool-metadata-store/  # Tool metadata storage
│   │   └── boulder-state/        # Boulder loop state (Sisyphus)
│   │
│   ├── shared/                   # 170+ utility files (barrel-exported)
│   │   ├── plugin-identity.ts    # NAMING CONSTANTS (CRITICAL FOR FORKING)
│   │   ├── model-requirements.ts # Per-agent fallback chains
│   │   ├── migrate-legacy-config-file.ts # Legacy config migration
│   │   └── ... (167+ files)
│   │
│   ├── config/                   # Zod v4 schema system (27 files)
│   │   ├── schema.ts             # Root schema
│   │   └── schema/               # Individual schema fragments
│   │
│   ├── cli/                      # CLI commands (Commander.js)
│   │   ├── cli-program.ts        # CLI program definition
│   │   ├── install.ts            # Interactive installer
│   │   ├── doctor/               # Health diagnostic checks
│   │   ├── run/                  # Non-interactive session
│   │   └── mcp-oauth/            # CLI OAuth flow
│   │
│   ├── mcp/                      # 3 built-in MCPs (remote HTTP)
│   │   ├── websearch.ts          # Web search (Exa/Tavily)
│   │   ├── context7.ts           # Documentation (mcp.context7.com)
│   │   └── grep-app.ts           # Code search (mcp.grep.app)
│   │
│   ├── openclaw/                 # Bidirectional external integration
│   │   ├── daemon.ts             # Background daemon process
│   │   ├── dispatcher.ts         # Notification dispatcher
│   │   ├── reply-listener-discord.ts  # Discord bot
│   │   ├── reply-listener-telegram.ts # Telegram bot
│   │   ├── tmux.ts               # tmux session management
│   │   └── session-registry.ts   # Session registry
│   │
│   ├── plugin/                   # 10 OpenCode hook handlers
│   │   └── hooks/                # Hook composition (core, continuation, skill)
│   │
│   └── plugin-handlers/          # 6-phase config loading pipeline
│
├── packages/                     # 11 platform-specific binaries
│   ├── darwin-arm64/
│   ├── darwin-x64/
│   ├── darwin-x64-baseline/
│   ├── linux-x64/
│   ├── linux-x64-baseline/
│   ├── linux-arm64/
│   ├── linux-x64-musl/
│   ├── linux-x64-musl-baseline/
│   ├── linux-arm64-musl/
│   ├── windows-x64/
│   └── windows-x64-baseline/
│
├── script/                       # Build/publish automation
│   ├── run-ci-tests.ts           # CI test splitting (mock.module() isolation)
│   ├── build-binaries.ts         # Platform binary compilation
│   ├── build-schema.ts           # JSON schema generation
│   └── generate-changelog.ts     # Changelog generation
│
├── .github/workflows/            # 7 CI workflows
├── .opencode/                    # OpenCode plugin config + commands + skills
├── .sisyphus/                    # AI agent workspace (rules, plans, tasks)
├── docs/                         # Documentation (guides, overview)
├── signatures/                   # Code signing
├── bin/                          # CLI binary
├── test-setup.ts                 # Test setup (preloaded via bunfig.toml)
├── bunfig.toml                   # Bun configuration
├── tsconfig.json                 # TypeScript configuration
├── bun.lock                      # Bun lockfile
└── postinstall.mjs               # Post-install binary download logic
```

---

## 5. Inventarisasi Rename (Blokir Forking)

Oracle mengidentifikasi **~849 referensi** di **~153 file** yang perlu di-rename.

### Konstanta Rename Kunci

File: `src/shared/plugin-identity.ts`

```typescript
export const PLUGIN_NAME = "oh-my-openagent"           // → nama Anda
export const LEGACY_PLUGIN_NAME = "oh-my-opencode"      // → nama Anda
export const PUBLISHED_PACKAGE_NAME = LEGACY_PLUGIN_NAME // → nama Anda
export const ACCEPTED_PACKAGE_NAMES = [PUBLISHED_PACKAGE_NAME, PLUGIN_NAME] as const
export const CONFIG_BASENAME = "oh-my-openagent"        // → nama Anda
export const LEGACY_CONFIG_BASENAME = "oh-my-opencode"  // → nama Anda
export const LOG_FILENAME = "oh-my-opencode.log"        // → nama-anda.log
export const CACHE_DIR_NAME = "oh-my-opencode"          // → nama Anda
```

### Kategori File yang Perlu di-Rename

| Kategori | Estimasi Refs | File | Detail |
|----------|---------------|------|--------|
| `package.json` (root + 11 platform) | ~66 di 14 file | `package.json`, `packages/*/package.json` | Name, bin, optionalDeps, repository, bugs, homepage |
| `src/shared/` | ~157 di 22 file | `plugin-identity.ts`, `migrate-legacy-config-file.ts`, dll. | Constants, log filename, cache dir name |
| `src/cli/` | ~30 di 8 file | `cli-program.ts` (`program.name("oh-my-opencode")`), `install.ts`, `doctor/` | Program name, CLI messages |
| `publish.yml` | ~15 | `.github/workflows/publish.yml`, `.github/workflows/publish-platform.yml` | Repo guard, npm steps, jq transforms |
| `docs/` | ~70 | `README.md`, `README.*.md`, `docs/guide/` | Branding, links, install instructions |
| `src/hooks/` | ~20 | Berbagai hook files | Log messages, plugin name checks |
| `src/agents/` | ~15 | Agent messages, metadata | Plugin name references |
| `src/config/` | ~25 | Schema files, `schema/*.ts` | Config file names, package names |
| `src/mcp/` | ~10 | MCP files | Plugin name references |
| `tests/` | ~50 | `*.test.ts` files | Name references, config paths |
| `.opencode/` | ~10 | Commands, skills | Plugin name |
| `postinstall.mjs` | ~5 | Root | Binary package names |

### Platform-Specific Naming Pattern

11 paket platform menggunakan naming convention `oh-my-opencode-{platform}`:

```
oh-my-opencode-darwin-arm64
oh-my-opencode-darwin-x64
oh-my-opencode-darwin-x64-baseline
oh-my-opencode-linux-x64
oh-my-opencode-linux-x64-baseline
oh-my-opencode-linux-arm64
oh-my-opencode-linux-x64-musl
oh-my-opencode-linux-x64-musl-baseline
oh-my-opencode-linux-arm64-musl
oh-my-opencode-windows-x64
oh-my-opencode-windows-x64-baseline
```

Semua perlu di-rename ke `{your-name}-{platform}`.

### publish.yml Dynamic Rewrite

`publish.yml` secara dinamis rewrite nama paket saat publish:
- Menggunakan `jq` untuk mengubah `package.json` `.name` dari `oh-my-opencode` ke `oh-my-openagent`
- Mengubah `optionalDependencies` prefix dari `oh-my-opencode-*` ke `oh-my-openagent-*`
- **Forker** perlu update jq script ini untuk nama sendiri

### Detail Tambahan dari Oracle

1. **Environment variable `OH_MY_OPENCODE_FORCE_BASELINE`** di `bin/oh-my-opencode.js` line 54 - perlu di-rename, tidak tercover oleh `plugin-identity.ts` constants
2. **Filename `bin/oh-my-opencode.js`** di-hardcode - forker harus rename file dan `bin` field di `package.json`
3. **Platform binary output paths** di `publish-platform.yml` meng-hardcode `oh-my-opencode` / `oh-my-opencode.exe` - harus diubah
4. **jq rewrite di publish.yml** lines 204-212 menggunakan `sub("^oh-my-opencode-"; "oh-my-openagent-")` - forker perlu adaptasi ke naming sendiri

---

## 6. Kunci Identitas Plugin

File `src/shared/plugin-identity.ts` adalah pusat semua identitas plugin. **Ini adalah file pertama yang harus diubah saat forking.**

```typescript
// Nilai saat ini (YANG PERLU DIUBAH):
PLUGIN_NAME = "oh-my-openagent"
LEGACY_PLUGIN_NAME = "oh-my-opencode"
PUBLISHED_PACKAGE_NAME = "oh-my-opencode"  // Points to LEGACY!
CONFIG_BASENAME = "oh-my-openagent"
LEGACY_CONFIG_BASENAME = "oh-my-opencode"
LOG_FILENAME = "oh-my-opencode.log"
CACHE_DIR_NAME = "oh-my-opencode"
```

Konsumen utama konstanta ini:
- `src/index.ts` - returns `{ name: "oh-my-openagent" }`
- `src/cli/cli-program.ts` - `program.name("oh-my-opencode")`
- `src/plugin-config.ts` - loads config using CONFIG_BASENAME
- `src/shared/migrate-legacy-config-file.ts` - migrates legacy configs
- Berbagai hook dan feature files

---

## 7. Dependensi & Ketergantungan Eksternal

### Runtime Dependencies

| Package | Version | Purpose | Fork Risk |
|---------|---------|---------|-----------|
| `@ast-grep/napi` | ^0.41.1 | AST-aware code search & replace | Aman - open source |
| `@opencode-ai/plugin` | ^1.4.0 | OpenCode plugin API | Aman - OpenCode ecosystem |
| `@opencode-ai/sdk` | ^1.4.0 | OpenCode SDK | Aman |
| `@modelcontextprotocol/sdk` | ^1.25.2 | MCP protocol | Aman - open source |
| `@code-yeongyu/comment-checker` | ^0.7.0 | AI comment detection | **LOCKED - same maintainer package** |
| `commander` | ^14.0.2 | CLI framework | Aman |
| `zod` | ^4.3.0 | Schema validation | Aman |
| `jsonc-parser` | ^3.3.1 | JSONC parsing | Aman |
| `diff` | ^8.0.3 | Diff computation | Aman |
| `picomatch` | ^4.0.2 | Glob pattern matching | Aman |
| `detect-libc` | ^2.0.0 | Platform detection | Aman |
| `vscode-jsonrpc` | ^8.2.0 | JSON-RPC protocol | Aman |
| `@clack/prompts` | ^0.11.0 | Interactive CLI prompts | Aman |
| `js-yaml` | ^4.1.1 | YAML parsing | Aman |
| `picocolors` | ^1.1.1 | Terminal colors | Aman |

### Peringatan `@code-yeongyu/comment-checker`

Paket ini dari maintainer YANG SAMA (`@code-yeongyu`). Tercantum di `trustedDependencies` dan berjalan saat install. Opsi:

1. **Fork paket ini juga** - cari di npm `@code-yeongyu/comment-checker`
2. **Hapus fitur comment-checker** - hapus hooks di `src/hooks/comment-checker/`, doctor checks, dan `trustedDependencies` references
3. **Pertahankan sebagai dependency** - tapi bergantung pada maintainer upstream

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `bun-types` | 1.3.11 | Bun types |
| `typescript` | ^5.7.3 | TypeScript compiler |
| `@types/js-yaml` | ^4.0.9 | YAML types |
| `@types/picomatch` | ^3.0.2 | Glob matching types |

---

## 8. Pipeline Build (Detail Langkah)

Build command adalah multi-step chain:

```
bun build src/index.ts --outdir dist --target bun --format esm --external @ast-grep/napi
  ↓
tsc --emitDeclarationOnly
  ↓
bun build src/cli/index.ts --outdir dist/cli --target bun --format esm --external @ast-grep/napi
  ↓
bun run build:schema  (bun run script/build-schema.ts)
```

### Detail Build Steps:

| Step | Command | Output | Notes |
|------|---------|--------|-------|
| 1. Plugin ESM | `bun build src/index.ts` | `dist/index.js` | Target: bun, format: ESM |
| 2. Types | `tsc --emitDeclarationOnly` | `dist/*.d.ts` | Declaration files |
| 3. CLI ESM | `bun build src/cli/index.ts` | `dist/cli/index.js` | Separate CLI bundle |
| 4. Schema | `bun run build:schema` | `dist/oh-my-opencode.schema.json` | Generated JSON schema |
| 5. Binaries | `bun run build:binaries` | `packages/*/index` | `bun compile` per platform |

### `--external` Flag:

**`@ast-grep/napi`** HARUS `--external` - ini adalah native binary yang tidak bisa di-bundle. Semua platform packages menyertakannya sebagai `optionalDependency`.

### `postinstall.mjs`:

Berjalan setelah npm install. Mendownload binary yang sesuai untuk platform saat ini. **Forker perlu update download URLs.**

### `bunfig.toml`:

```toml
[test]
preload = ["./test-setup.ts"]
```

File `test-setup.ts` mereset session/cache state antar tests.

---

## 9. Infrastruktur Test

### Test Framework: `bun:test`

- Pattern: `*.test.ts` co-located dengan source files
- Style: given/when/then (nested `describe` dengan `#given`/`#when`/`#then` prefixes)
- Setup: `test-setup.ts` preloaded via `bunfig.toml`
- Command: `bun test`

### CI Test Splitting:

`script/run-ci-tests.ts` menangani test isolation:
- **Auto-detects** files yang menggunakan `mock.module()` (global state pollution)
- **Isolates** test-test tersebut dalam process terpisah
- **Special exception**: `src/openclaw/__tests__/reply-listener-discord.test.ts` selalu diisolasi
- Menjalankan remaining tests dalam satu batch process

### Mock Infrastructure:

Mock directories (di `src/hooks/`):
- `zauc-mocks-bg/` - Background task mocks
- `zauc-mocks-cache/` - Cache mocks
- `zauc-mocks-hook/` - Hook mocks
- `zauc-mocks-ws/` - WebSocket mocks
- `zauc-sync-mocks/` - Sync mocks

---

## 10. Pipeline CI/CD (Detail)

### Branch Strategy:

| Branch | Purpose | Protection |
|--------|---------|------------|
| `dev` | Default development branch | Target untuk semua PR |
| `master` | Release branch | Protected, PR DIBLOKIR, di-reset ke tag saat publish |

### Workflow Files:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR ke master/dev | Test + typecheck + build |
| `publish.yml` | Manual dispatch | Version, build, dual npm publish, GitHub release |
| `publish-platform.yml` | Called by publish | 11 platform binaries |
| `refresh-model-capabilities.yml` | Weekly cron + dispatch | Update model capabilities snapshot |
| `sisyphus-agent.yml` | Dispatch + issue comment | Automated AI agent tasks |
| `cla.yml` | Issue comment / PR | CLA assistant |
| `lint-workflows.yml` | Push to `.github/` | actionlint + shellcheck |

### Release Flow (`publish.yml`):

```
1. Test + Typecheck
   ↓
2. Calculate version (dari npm registry latest + bump type)
   ↓
3. Update package.json versions (root + 11 platform packages)
   ↓
4. Build main package
   ↓
5. Publish "oh-my-opencode" ke npm
   ↓
6. Rename package.json → "oh-my-openagent", republish
   ↓
7. Build 11 platform binaries (via publish-platform.yml)
   ↓
8. Generate changelog
   ↓
9. Git commit + tag + push
   ↓
10. Create GitHub release
   ↓
11. Force-reset master ke tag
```

### Repo-Locked CI Guard:

```yaml
# Di publish.yml:
if: github.repository == 'code-yeongyu/oh-my-openagent'

# Juga di refresh-model-capabilities.yml line 15
```

**FORKER HARUS** mengubah ini ke nama repo sendiri, atau publish akan skip silently.

---

## 11. Sistem Konfigurasi (Zod v4)

### Config Levels:

```
Project (.opencode/oh-my-openagent.jsonc)
  → User (~/.config/opencode/oh-my-openagent.jsonc)
    → Defaults (Zod safeParse)
```

### Key Config Fields:

| Field | Type | Purpose |
|-------|------|---------|
| `agents` | Object (14 overridable, 21 fields each) | Agent configuration |
| `categories` | Object (8 built-in + custom) | Task delegation categories |
| `disabled_*` | Arrays (agents, hooks, mcps, skills, commands, tools) | Disabled features lists |
| `mcp_env_allowlist` | Array | Allowed env vars for MCPs |
| `hashline_edit` | Object | Content-hash editing config |
| `model_fallback` | Object | Proactive model fallback chains |
| `runtime_fallback` | Object | Reactive fallback chains |
| `websearch` | Object | Web search config |
| `tmux` | Object | tmux subagent config |
| `claude_code` | Object | Claude Code compatibility settings |
| `openclaw` | Object | Discord/Telegram integration config |
| `default_run_agent` | String | Default agent for run mode |
| `new_task_system_enabled` | Boolean | Enable new task system |

### Config Migration:

`migrateLegacyConfigFile()` otomatis mengkonversi config lama `oh-my-opencode` ke `oh-my-openagent`:
- Membuat timestamped backups
- Atomic writes
- Idempotent via `_migrations` tracking

### Schema Generation:

`bun run build:schema` menghasilkan `dist/oh-my-opencode.schema.json` - auto-committed by CI.

---

## 12. Sistem Agent (11 Agent)

| Agent | Type | Function |
|-------|------|----------|
| **Sisyphus** | Primary orchestrator | Delegates & coordinates all agents |
| **Oracle** | Read-only consultant | Architecture, debugging, hard decisions |
| **Librarian** | Reference grep | External docs, OSS examples |
| **Explore** | Contextual grep | Internal codebase search |
| **Prometheus** | Plan builder | Structured planning with interview workflow |
| **Metis** | Pre-planning | Analyzes ambiguities, hidden intentions |
| **Momus** | Plan critic | Reviews plan clarity & completeness |
| **Hephaestus** | Code generator | Batch code generation |
| **Atlas** | Multi-repo | Multi-repository coordination |
| **Sisyphus-Junior** | Task executor | Delegated focused execution |
| **Multimodal-Looker** | Media analyzer | PDF, images, diagrams analysis |

### Agent Modes:
- `primary` - Respects UI model
- `subagent` - Own fallback chain
- `all` - Available in both modes

---

## 13. Sistem Hook (52 Hook)

| Tier | Count | Function |
|------|-------|----------|
| **Session** | 24 | Session lifecycle (setup, keyword detection, variant detection) |
| **Tool-Guard** | 14 | Pre/post tool execution guards (file guard, labeling, rules) |
| **Transform** | 5 | Context/message transformation (injection, thinking validation) |
| **Continuation** | 7 | Auto-continue mechanisms (ralph, ultrawork, todo) |
| **Skill** | 2 | Skill loading & invocation |

### Composition (dari `src/create-hooks.ts`):

```typescript
const core = createCoreHooks({...})          // session + tool guard + transform
const continuation = createContinuationHooks({...})  // ralph, ultrawork, todo
const skill = createSkillHooks({...})        // skill loading & invocation
const hooks = { ...core, ...continuation, ...skill }
```

---

## 14. Sistem Tool (26 Tool)

| Tool | Function |
|------|----------|
| `delegate_task` | Task delegation to Sisyphus-Junior (main `task()` call) |
| `hashline_edit` | Content-hash verified file editing |
| `lsp_*` | Language Server Protocol tool suite (hover, goto_def, find_refs, rename, dll.) |
| `ast_grep_search` | AST-aware pattern search |
| `ast_grep_replace` | AST-aware pattern replacement |
| `background_task` | Background task management (spawn, output, cancel) |
| `session_manager` | Session persistence & search |
| `skill_mcp` | MCP invocation from skills |
| `skill` | Skill loading & management |
| `slashcommand` | Slash command execution |
| `interactive_bash` | tmux-based interactive bash sessions |
| `glob` | Glob pattern file search |
| `grep` | Content search |
| `look_at` | Media file inspection |
| `call_omo_agent` | Inter-agent communication |
| `python_repl` | Persistent Python REPL environment |
| `state_read/write/clear` | Mode state management (ralph, ultrawork, etc.) |
| `notepad_*` | Notepad system (priority, working, manual) |
| `project_memory_*` | Cross-session project memory |
| `trace_*` | Agent flow tracing |
| `zread_*` | Remote repository reading tools |
| `websearch` | Web search |
| `context7` | Documentation querying |
| `grep_app` | GitHub code search |
| `webfetch` | URL fetching |
| `question` | User interaction |

---

## 15. Integrasi MCP

### Three-Tier MCP Architecture:

| Tier | Source | Mechanism |
|------|--------|-----------|
| **Built-in** | `src/mcp/` | 3 remote HTTP: websearch (Exa/Tavily), context7, grep_app |
| **Claude Code** | `.mcp.json` | `${VAR}` env expansion via `claude-code-mcp-loader` |
| **Skill-embedded** | SKILL.md YAML | Managed by `SkillMcpManager` (stdio + HTTP, per-session) |

### Built-in MCPs:

```typescript
// src/mcp/context7.ts
{ type: "remote", url: "https://mcp.context7.com/mcp", ... }

// src/mcp/grep-app.ts
{ type: "remote", url: "https://mcp.grep.app", ... }

// src/mcp/websearch.ts - Web search (Exa/Tavily)
```

---

## 16. Integrasi OpenClaw

OpenClaw adalah integrasi eksternal **bidirectional** (Discord/Telegram/webhook):

| Component | Function |
|-----------|----------|
| `daemon.ts` | Background daemon process |
| `dispatcher.ts` | Notification dispatcher |
| `reply-listener-discord.ts` | Discord bot untuk AI interaction |
| `reply-listener-telegram.ts` | Telegram bot untuk AI interaction |
| `reply-listener.ts` | Reply listener orchestrator |
| `tmux.ts` | tmux session management |
| `session-registry.ts` | Session tracking |
| `config.ts` | OpenClaw configuration |

Dikonfigurasi melalui bagian `openclaw` di config schema.

---

## 17. Sistem Skill

### Skill Tiers:

| Tier | Source | Priority |
|------|--------|----------|
| 1 (highest) | `builtin` | `src/features/builtin-skills/` |
| 2 | `config` | `config.skills paths` |
| 3 | `user-claude` | `~/.claude/skills/` |
| 4 | `user-opencode` | `~/.config/opencode/skills/` |
| 5 | `project-claude` | `.claude/skills/` |
| 6 (lowest) | `project-opencode` | `.opencode/skills/` |

### Skill Discovery:

- `src/tools/skill/` menangani skill loading dan discovery
- `src/features/opencode-skill-loader/` - Loads skills dari berbagai sources
- `src/features/builtin-skills/` - Pre-packaged skills
- `src/features/builtin-commands/` - Pre-packaged commands

### Skill-Embedded MCPs:

Skills dapat mendeklarasikan MCP servers di SKILL.md YAML mereka, dikelola oleh `SkillMcpManager` (stdio + HTTP, per-session).

---

## 18. Resolusi Model & Fallback

### 4-Step Model Resolution:

```
Override → Category-default → Provider-fallback → System-default
```

### Dua Sistem Fallback Terpisah:

| System | Hook | Behavior |
|--------|------|----------|
| **model-fallback** | `chat.params` | Proactive - sets model before request |
| **runtime-fallback** | `session.error` | Reactive - switches model on error |

### Per-Agent Fallback Chains:

Didefinisikan di `src/shared/model-requirements.ts`. Setiap agent memiliki model priority chain sendiri.

---

## 19. Binary Platform

### Build Matrix (11 targets):

| Target | Notes |
|--------|-------|
| `darwin-arm64` | Apple Silicon |
| `darwin-x64` | Intel Mac |
| `darwin-x64-baseline` | Intel Mac (no AVX2) |
| `linux-x64` | Linux x86_64 (glibc) |
| `linux-x64-baseline` | Linux x86_64 (no AVX2) |
| `linux-arm64` | Linux ARM64 (glibc) |
| `linux-x64-musl` | Linux x86_64 (Alpine/musl) |
| `linux-x64-musl-baseline` | Linux x86_64 musl (no AVX2) |
| `linux-arm64-musl` | Linux ARM64 (Alpine/musl) |
| `windows-x64` | Windows x86_64 |
| `windows-x64-baseline` | Windows x86_64 (no AVX2) |

### Build Mechanism:

- Uses `bun compile` per platform
- Runtime AVX2 detection, fallback ke baseline
- Runtime libc detection (glibc vs musl)
- Windows builds run on `windows-latest` runner (not cross-compiled)

---

## 20. Kontributor & Aktivitas

### Top Contributors:

| Contributor | Commits | Notes |
|-------------|---------|-------|
| code-yeongyu | 3,138 | Main maintainer |
| github-actions[bot] | 488 | CI/CD automation |
| sisyphus-dev-ai | 251 | AI agent (generated contributor) |
| justsisyphus | 239 | AI agent (generated contributor) |
| acamq | 77 | Community contributor |
| kdcokenny | 69 | Community contributor |
| MoerAI | 57 | Community contributor |
| RaviTharuma | 33 | Community contributor |
| junhoyeo | 22 | Community contributor |
| devxoul | 19 | Community contributor |

### Rilis Terbaru:

| Version | Date |
|---------|------|
| v3.16.0 | 8 April 2026 |
| v3.15.3 | 6 April 2026 |
| v3.15.2 | 5 April 2026 |
| v3.14.0 | 26 Maret 2026 |
| v3.13.1 | 25 Maret 2026 |

### Branch Fitur Aktif:

```
feat/athena                    # Athena agent
feat/athena-council-agent      # Multi-agent council
feat/claude-model-mapper       # Claude model mapping
feat/cmux-integration          # Terminal multiplexer integration
feat/native-agent-teams-port   # Native agent teams
feat/oracle-gpt-5.4            # Oracle GPT-5.4 support
feat/rename-openagent          # Rename (still in progress)
```

---

## 21. Panduan Forking Langkah demi Langkah

### Pre-Work: Keputusan Legal

1. **Baca SUL-1.0 dengan seksama** (`LICENSE.md`)
2. **Tentukan apakah penggunaan Anda komersial** - jika ya, perlu lisensi terpisah
3. **Jika non-komersial/pribadi**: Anda bebas melanjutkan

### Step 1: Fork di GitHub

```
1. Fork repo menggunakan tombol GitHub fork
2. Rename forked repo Anda (mis., `your-name/your-plugin`)
3. Clone locally
4. Install Bun 1.3.11: `curl -fsSL https://bun.sh/install | bash`
5. Run: `bun install`
```

### Step 2: Core Identity (File Pertama yang Diubah)

```
1. src/shared/plugin-identity.ts
   - Ubah PLUGIN_NAME, LEGACY_PLUGIN_NAME, PUBLISHED_PACKAGE_NAME
   - Ubah CONFIG_BASENAME, LEGACY_CONFIG_BASENAME
   - Ubah LOG_FILENAME, CACHE_DIR_NAME

2. package.json
   - Ubah "name" ke nama paket Anda
   - Ubah "bin" key
   - Ubah "repository", "bugs", "homepage" URLs
   - Ubah "optionalDependencies" keys (platform prefix)

3. src/index.ts
   - Update `name` in return object

4. src/cli/cli-program.ts
   - Update `program.name("your-name")`
```

### Step 3: Platform Packages (11 file)

```
Untuk setiap packages/{platform}/package.json:
1. Ubah "name" ke "your-name-{platform}"
2. Update semua referensi
```

### Step 4: @code-yeongyu/comment-checker Dependency

```
PILIH:
A) Fork @code-yeongyu/comment-checker dan publish di bawah namespace Anda
B) Hapus comment-checker feature (src/hooks/comment-checker/, doctor refs, trustedDependencies)
C) Pertahankan sebagai dependency (risk: under upstream maintainer control)
```

### Step 5: CI/CD Workflows

```
1. .github/workflows/publish.yml
   - Ubah guard: github.repository == 'your-name/your-plugin'
   - Update jq steps untuk nama paket Anda
   - Update npm registry check URLs
   - Update platform binary references

2. .github/workflows/publish-platform.yml
   - Update publish steps package names
   - Update platform matrix

3. .github/workflows/ci.yml
   - Update build artifact existence checks

4. Set up secrets: NODE_AUTH_TOKEN (npm token Anda)
```

### Step 6: Documentation

```
1. Update README.md, README.*.md (names, links, install instructions)
2. Update docs/guide/overview.md
3. Update CONTRIBUTING.md
4. Update LICENSE.md (add your modification notice)
5. Update CLI messages (src/cli/)
```

### Step 7: Config Setup

```
1. Update config file names (.opencode/oh-my-openagent.jsonc → nama Anda)
2. Update migration logic (src/shared/migrate-legacy-config-file.ts)
3. Update doctor checks (src/cli/doctor/)
```

### Step 8: Postinstall

```
1. Update postinstall.mjs - change binary download URLs
2. Update binary package names yang di-download
```

### Step 9: Environment Variables

```
1. Rename OH_MY_OPENCODE_FORCE_BASELINE env var di bin/oh-my-opencode.js
2. Rename bin/oh-my-opencode.js file itu sendiri
```

### Step 10: Verification

```
1. Run: bun install
2. Run: bun run typecheck
3. Run: bun test
4. Run: bun run build
5. Check dist/index.js dan dist/index.d.ts exist
6. Test CLI: bun run src/cli/index.ts doctor
```

### Step 11: Publishing

```
1. Buat akun/organisasi npm
2. Set NODE_AUTH_TOKEN di GitHub secrets Anda
3. Trigger publish.yml workflow dengan version bump
4. Verifikasi paket ter-publish
```

---

## Ringkasan: Forking Risk Map

| Risk | Level | Mitigasi |
|------|-------|----------|
| **SUL-1.0 License** | TINGGI | Validasi penggunaan Anda komersial atau tidak |
| **Rename volume (~849 refs)** | TINGGI | Mulai dari `plugin-identity.ts`, lalu search & replace global |
| **`@code-yeongyu/comment-checker` lock-in** | SEDANG | Fork, hapus, atau terima dependency |
| **CI repo-locked guard** | SEDANG | Update `github.repository` check |
| **11 platform packages** | SEDANG | Script rename untuk semua platform `package.json` |
| **Dual publish system** | RENDAH | Update jq steps di `publish.yml` |
| **`ohmyopenagent.com` domain refs** | RENDAH | Domain ini dimiliki maintainer |
| **Sisyphus Labs branding** | RENDAH | Ganti Discord links, brand references |
| **~1600 source files** | INFO | Code changes utama hanya di identity/constants |

---

> **Catatan:** Analisis ini diverifikasi oleh Oracle (2x independent verification). Semua klaim utama telah di-cross-check terhadap bukti codebase. Referensi silang: ~849 referensi di ~153 file untuk kedua nama paket.
