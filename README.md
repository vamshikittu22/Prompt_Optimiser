# Prompt Optimizer

A powerful tool for creating and optimizing AI prompts through a guided 3-step process.

## Features

- 🎯 **3-Step Guided Process**: Idea → Clarification → Optimized Prompt
- 🤖 **Multiple AI Models**: Support for Gemini, OpenRouter, Anthropic, and OpenAI
- 💾 **Prompt History**: Save and manage your optimized prompts
- 🎨 **Style Selection**: Choose from various prompting styles
- 📋 **Export Options**: Copy, download as TXT or JSON
- 📱 **Responsive Design**: Works on desktop and mobile

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd Prompt_Optimiser
   npm install
   ```

2. **Configure API keys:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## API Key Setup

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions on configuring API keys.

### Quick Setup
1. Copy `.env.example` to `.env`
2. Add your API keys to the `.env` file
3. Restart the development server

## Usage

1. **Step 1**: Enter your idea and instructions
2. **Step 2**: Select prompting styles and answer clarifying questions
3. **Step 3**: Get your optimized prompt and save it to history

## Available Models

- **Gemini Pro** (Google AI)
- **Claude 3 Haiku** (Anthropic via OpenRouter)
- **Mistral 7B** (OpenRouter)
- **Llama 3 8B** (OpenRouter)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

The app supports multiple API providers through environment variables:

- `VITE_GEMINI_API_KEY` - Google AI API key
- `VITE_OPENROUTER_API_KEY` - OpenRouter API key
- `VITE_ANTHROPIC_API_KEY` - Anthropic API key
- `VITE_OPENAI_API_KEY` - OpenAI API key

## License

MIT License
