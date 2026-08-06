# Corro

> The open-source evidence layer for spec-driven development.

Customer calls → evidence-cited insights → agent-ready specs → MCP live contract.

![Eval Score](https://img.shields.io/badge/faithfulness-16.8%25-orange)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/corroapp/corro/actions/workflows/ci.yml/badge.svg)](https://github.com/corroapp/corro/actions)

## How It Works

```
📞 Customer Call (.vtt/.srt)
        │
        ▼
  ┌─────────────┐
  │   Ingest     │  Parse transcripts into speaker-tagged turns
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │   Chunk      │  Dialogue-aware chunks with ±1 turn context window
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │   Extract    │  LLM extracts pain/request/praise/confusion insights
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │   Cluster    │  Cosine similarity groups insights into themes
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │  Synthesize  │  Generates a Markdown report with citations
  └─────────────┘
         │
         ▼
  📊 Evidence-cited report with every claim traced to a verbatim quote
```

*Specs feed coding agents today, but they're written from memory, not evidence. Corro fixes this by tracing every insight back to a verbatim customer quote. Compatible with OpenSpec and Spec Kit.*

## Why This Exists

1. Coding agents (Cursor, Claude Code) are only as good as the specs they receive.
2. Most specs are written from memory — no evidence, no citations, no trust.
3. Corro turns raw customer calls into evidence-cited insight reports where every claim links to a verbatim quote and timestamp.

## Evals

We publish our eval scores on every release. Trust is the product.

| Metric | Score | Note |
|---|---|---|
| **Faithfulness** | 16.8% | Percentage of generated claims that trace directly to a verbatim transcript quote. |
| **Precision** | 16.8% | Accuracy of extraction against a 53-point human-labeled Golden Set. |
| **Recall** | 64.2% | Percentage of human-labeled Golden Set insights successfully found by the AI. |

*(Note: These are our V1 baseline scores. The prompt is currently over-extracting minor complaints. We are tuning the extraction threshold to push Precision > 90% in upcoming commits).*

## Quickstart

### Option A: CLI (for developers)

```bash
# 1. Clone and install
git clone https://github.com/corro-ai/corro.git
cd corro
pnpm install

# 2. Set up your .env file with Supabase, Groq, and Gemini keys

# 3. Run the full pipeline on the sample transcript
pnpm --filter @corro/cli corro run ./examples/product_feedback_call.vtt --project "$(uuidgen)"
```

### Option B: Web App (for PMs)

```bash
# 1. Clone and install
git clone https://github.com/corro-ai/corro.git
cd corro
pnpm install

# 2. Set up apps/web/.env.local with your Supabase keys

# 3. Start the web app
pnpm --filter web dev

# 4. Start the Inngest dev server (in a separate terminal)
npx inngest-cli@latest dev

# 5. Open http://localhost:3000, drag and drop a .vtt file, and wait for your report!
```

## Architecture

```
corro/
├── apps/
│   └── web/                    # Next.js web app (drag-and-drop upload → report viewer)
│       ├── app/
│       │   ├── page.tsx        # Upload UI with polling state machine
│       │   └── api/
│       │       ├── inngest/    # Inngest serve endpoint + trigger route
│       │       └── report/     # Report status polling endpoint
│       └── src/inngest/        # Background pipeline (Inngest functions)
│
├── packages/
│   ├── ingest/                 # VTT/SRT/TXT/DOCX parser → speaker-tagged turns
│   ├── chunk/                  # Dialogue-aware chunking with ±1 context window
│   ├── extract/                # Groq (Llama 3.3 70B) insight extraction with hallucination guard
│   ├── cluster/                # Cosine similarity clustering + LLM theme labeling
│   ├── synthesize/             # Gemini report generation with evidence citations
│   ├── transcribe/             # Groq Whisper audio → text
│   ├── db/                     # Drizzle ORM schema (Supabase/Postgres)
│   └── cli/                    # CLI tool for running the pipeline locally
│
└── examples/                   # Sample transcripts for testing
```

**Tech stack:** TypeScript · Next.js · Supabase (Postgres + Storage) · Inngest (background jobs) · Groq (Llama 3.3 70B + Whisper) · Google Gemini · Drizzle ORM · pnpm monorepo

## Roadmap

- [x] **Phase 1:** Open-source evidence pipeline (ingest → chunk → extract → cluster → synthesize)
- [x] **Phase 1.5:** Web app with drag-and-drop upload, background pipeline via Inngest, and report polling
- [ ] **Phase 2:** Eval-driven improvement (faithfulness > 90%, precision > 90%)
- [ ] **Phase 3:** Qual × Quant opportunity engine (PostHog integration)
- [ ] **Phase 4:** Bidirectional MCP server for coding agents (live spec contracts)

## Built in Public

Corro is built entirely in public. Follow the journey on [X](https://x.com/pushkarpandey).

---

*Generated reports include a footer: "Generated by [Corro](https://github.com/corro-ai/corro) — The evidence layer for spec-driven development."*
