# AI Provider Reference

AeroAgent supports 24 AI providers. All providers use the OpenAI-compatible chat completions API unless noted otherwise.

## Provider Overview

| # | Provider | Type | Base URL | Auth |
|---|----------|------|----------|------|
| 1 | OpenAI | `openai` | `https://api.openai.com/v1` | API Key |
| 2 | Anthropic | `anthropic` | `https://api.anthropic.com/v1` | API Key |
| 3 | Google Gemini | `google` | `https://generativelanguage.googleapis.com/v1beta` | API Key |
| 4 | xAI (Grok) | `xai` | `https://api.x.ai/v1` | API Key |
| 5 | OpenRouter | `openrouter` | `https://openrouter.ai/api/v1` | API Key |
| 6 | Ollama (Local) | `ollama` | `http://localhost:11434` | None |
| 7 | Kimi (Moonshot) | `kimi` | `https://api.moonshot.cn/v1` | API Key |
| 8 | Qwen (Alibaba) | `qwen` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` | API Key |
| 9 | DeepSeek | `deepseek` | `https://api.deepseek.com` | API Key |
| 10 | Mistral | `mistral` | `https://api.mistral.ai/v1` | API Key |
| 11 | Groq | `groq` | `https://api.groq.com/openai/v1` | API Key |
| 12 | Perplexity | `perplexity` | `https://api.perplexity.ai` | API Key |
| 13 | Cohere | `cohere` | `https://api.cohere.com/compatibility/v1` | API Key |
| 14 | Together AI | `together` | `https://api.together.xyz/v1` | API Key |
| 15 | AI21 Labs | `ai21` | `https://api.ai21.com/studio/v1` | API Key |
| 16 | Cerebras | `cerebras` | `https://api.cerebras.ai/v1` | API Key |
| 17 | SambaNova | `sambanova` | `https://api.sambanova.ai/v1` | API Key |
| 18 | Fireworks AI | `fireworks` | `https://api.fireworks.ai/inference/v1` | API Key |
| 19 | Custom | `custom` | User-defined | User-defined |

## Feature Matrix

| Provider | Streaming | Tools | Vision | Thinking | Structured Output |
|----------|:---------:|:-----:|:------:|:--------:|:-----------------:|
| OpenAI | Yes | Yes | Yes | Yes (o3) | Yes (`strict:true`) |
| Anthropic | Yes | Yes | Yes | Yes | No |
| Google Gemini | Yes | Yes | Yes | Yes | No |
| xAI (Grok) | Yes | Yes | Yes | No | Yes (`strict:true`) |
| OpenRouter | Yes | Yes | Yes | Varies | Yes (`strict:true`) |
| Ollama | Yes | Yes | Yes | Varies | No |
| Kimi | Yes | Yes | No | No | No |
| Qwen | Yes | Yes | Yes | No | No |
| DeepSeek | Yes | Yes | No | Yes | No |
| Mistral | Yes | Yes | Yes | No | No |
| Groq | Yes | Yes | Yes | No | No |
| Perplexity | Yes | No | No | No | No |
| Cohere | Yes | Text | No | No | No |
| Together AI | Yes | Yes | Varies | No | No |
| AI21 Labs | Yes | Yes | No | No | No |
| Cerebras | Yes | Yes | No | No | No |
| SambaNova | Yes | Yes | No | No | No |
| Fireworks AI | Yes | Yes | Varies | No | No |
| Custom | Yes | Configurable | Configurable | No | No |

## Models

AeroFTP does not ship with hardcoded default models. Use the **Models** button in AI Settings to fetch available models from each provider dynamically.

For Ollama, the **Detect** button queries `GET /api/tags` to list locally installed models. You can also **pull** new models directly from the UI via `POST /api/pull` with streaming progress.

## Provider-Specific Notes

### Anthropic

- Uses native Anthropic API format (not OpenAI-compatible)
- **Prompt caching**: Supports `cache_control: { type: "ephemeral" }` for 90% read discount on cached prefixes
- **System prompt**: Sent as top-level `system` field
- **Thinking**: Native `thinking` blocks with configurable budget (0-100K tokens)

### Google Gemini

- Uses Gemini-native API format
- **System instruction**: Sent as top-level `system_instruction` field (not as a message)
- **Code execution**: Supports `executableCode` / `codeExecutionResult` blocks
- **Context caching**: `gemini_create_cache` for reusing large context prefixes

### Ollama

- Runs locally, no API key required
- **Model families**: 8 detected profiles (llama, mistral, phi, gemma, qwen, deepseek, codellama, vicuna) with family-specific prompt styles
- **GPU monitoring**: `ollama_list_running` shows active models and VRAM usage
- **Model pull**: Download models from the Ollama registry with streaming progress bar

### OpenRouter

- Aggregator: routes to 100+ models from multiple providers
- Uses OpenAI-compatible format
- Structured output support depends on the underlying model

### DeepSeek

::: warning Endpoint Format
DeepSeek's base URL is `https://api.deepseek.com` without a trailing `/v1`. The `/v1/chat/completions` path is appended by the client.
:::

### Cohere

::: warning Compatibility Endpoint
Cohere uses the compatibility endpoint at `https://api.cohere.com/compatibility/v1`, not the native `/v2` API. Tool format is text-based, not native function calling.
:::

### stream_options

The `stream_options: { include_usage: true }` field is included in streaming requests to receive token usage in the final chunk. This field is **excluded** for Cohere and Perplexity, which reject unknown fields.

## Provider Profiles

Each provider has a built-in personality profile that optimizes the system prompt for that provider's strengths:

- **Parameter presets**: Creative, Balanced, and Precise temperature/top_p configurations
- **Capability awareness**: The system prompt adapts based on whether the provider supports tools, vision, and thinking
- **Ollama model-specific templates**: Prompt format adapts to the detected model family

## Thinking Budget

For providers that support reasoning/thinking (Anthropic, OpenAI o3, Gemini, DeepSeek), AeroAgent offers 5 presets:

| Preset | Token Budget | Use Case |
|--------|-------------|----------|
| Off | 0 | Simple queries |
| Light | 1,024 | Quick reasoning |
| Balanced | 8,192 | General use |
| Deep | 32,768 | Complex analysis |
| Maximum | 100,000 | Full reasoning chain |

A range slider allows fine-tuning between 0 and 100,000 tokens.

## Adding a Custom Provider

Any OpenAI-compatible API can be added as a Custom provider:

1. Go to **Settings > AeroAgent > Providers**
2. Click **Add Provider** or use the **Provider Marketplace**
3. Select **Custom**
4. Enter the base URL and API key
5. Use the **Models** button to fetch available models

The base URL should point to the root of the API (e.g., `https://my-provider.com/v1`). AeroFTP appends `/chat/completions` automatically.
