# AI Gateway

An OpenRouter-style AI Gateway that aggregates multiple LLM providers and exposes a unified API.

## Features

- **Unified API**: OpenAI-compatible API endpoint for all supported models
- **Multi-provider**: Supports OpenAI, Anthropic, Google Gemini, Mistral, and more
- **Model routing**: Route requests to the right provider based on model name
- **Auth & billing**: API key management and usage tracking
- **Streaming**: Full SSE streaming support
- **Fallback**: Automatic failover between providers

## Supported Providers

| Provider | Models |
|---|---|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo |
| Anthropic | claude-opus-4, claude-sonnet-4, claude-haiku-4 |
| Google | gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash |
| Mistral | mistral-large, mistral-medium, mistral-small |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your provider API keys

# Start development server
npm run dev

# Production
npm run build && npm start
```

## API Usage

```bash
# Chat completions (OpenAI-compatible)
curl https://your-gateway.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client    │────▶│   AI Gateway     │────▶│  OpenAI         │
│             │     │                  │     │  Anthropic      │
│  API Key    │     │  - Auth          │     │  Google Gemini  │
│  Model Name │     │  - Rate Limit    │     │  Mistral        │
│  Messages   │     │  - Routing       │     │  ...            │
└─────────────┘     │  - Normalization │     └─────────────────┘
                    │  - Streaming     │
                    └──────────────────┘
```

## Project Structure

```
src/
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── config/             # Configuration
│   └── providers.ts    # Provider definitions
├── routes/
│   └── v1/
│       └── chat.ts     # /v1/chat/completions endpoint
├── providers/          # Provider adapters
│   ├── base.ts         # Base provider interface
│   ├── openai.ts
│   ├── anthropic.ts
│   ├── google.ts
│   └── mistral.ts
├── middleware/
│   ├── auth.ts         # API key validation
│   └── rateLimit.ts    # Rate limiting
├── services/
│   ├── router.ts       # Model-to-provider routing
│   └── usage.ts        # Usage tracking
└── types/
    └── index.ts        # Shared types
```

## License

MIT
