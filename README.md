# Corro

> The open-source evidence layer for spec-driven development.

Customer calls + PostHog → evidence-cited insights → agent-ready specs → MCP live contract.

![Eval Score](https://img.shields.io/badge/faithfulness-pending-blue)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/corroapp/corro/actions/workflows/ci.yml/badge.svg)](https://github.com/corroapp/corro/actions)

## Architecture

![Architecture Placeholder](https://placehold.co/800x400/png?text=Architecture+Diagram+Placeholder)

*Specs feed coding agents today, but they're written from memory, not evidence. Corro fixes this by tracing every task an agent receives back to a verbatim customer quote and metric snapshot. Compatible with OpenSpec and Spec Kit.*

## Evals

We publish our eval scores on every release. Trust is the product.

| Metric | Score | Note |
|---|---|---|
| **Faithfulness** | 16.8% | Percentage of generated claims that trace directly to a verbatim transcript quote. |
| **Precision** | 16.8% | Accuracy of extraction against a 53-point human-labeled Golden Set. |
| **Recall** | 64.2% | Percentage of human-labeled Golden Set insights successfully found by the AI. |

*(Note: These are our V1 baseline scores! The prompt is currently over-extracting minor complaints. We are tuning the extraction threshold to push Precision > 90% in upcoming commits).*

## Quickstart

Right now, Corro supports the first step of the pipeline: **Ingestion**. You can upload Zoom transcripts (`.vtt`, `.srt`), plain text (`.txt`, `.docx`), or raw audio (`.mp3`, `.mp4`) and we will parse it into context-aware chunks saved to Supabase.

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/corro-ai/corro.git
   cd corro
   pnpm install
   ```

2. Set up your `.env` file with your Supabase and Groq keys.

3. Generate a UUID for your project:
   ```bash
   uuidgen
   # Example: 6AC3C351-8D82-4CDD-97C4-65BD2D5BC881
   ```

4. Run the ingestion pipeline using the sample transcript:
   ```bash
   pnpm --filter @corro/cli corro ingest ./examples/product_feedback_call.vtt --project "<YOUR-UUID>"
   ```

## Roadmap

1. **Phase 1 (WIP):** Open-source evidence pipeline (ingest, chunk, extract, cluster, report).
2. **Phase 2:** RAG corpus Q&A with trust UX (inline citations, confidence scoring).
3. **Phase 3:** Qual × Quant opportunity engine (PostHog integration).
4. **Phase 4:** Bidirectional MCP server for coding agents.

## Built in Public

Corro is built entirely in public. Follow the journey on [X](https://x.com/pushkarpandey).
