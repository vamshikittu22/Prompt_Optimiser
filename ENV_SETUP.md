# Environment Variables Setup

This document explains how to configure API keys for the Prompt Optimizer application.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file** and add your actual API keys:
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_key_here
   VITE_OPENROUTER_API_KEY=your_actual_openrouter_key_here
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Available API Keys

### Google AI (Gemini)
- **Variable:** `VITE_GEMINI_API_KEY`
- **Get your key:** https://ai.google.dev/api/rest
- **Usage:** For Gemini Pro model

### OpenRouter
- **Variable:** `VITE_OPENROUTER_API_KEY`
- **Get your key:** https://openrouter.ai/keys
- **Usage:** For accessing multiple models through OpenRouter

### Anthropic (Claude)
- **Variable:** `VITE_ANTHROPIC_API_KEY`
- **Get your key:** https://console.anthropic.com/settings/keys
- **Usage:** For direct Anthropic API access

### OpenAI
- **Variable:** `VITE_OPENAI_API_KEY`
- **Get your key:** https://platform.openai.com/api-keys
- **Usage:** For direct OpenAI API access

## Configuration Options

### Default Model
- **Variable:** `VITE_DEFAULT_MODEL`
- **Default:** `gemini-pro`
- **Options:** Any model ID from the available models list

### Fallback Model
- **Variable:** `VITE_FALLBACK_MODEL`
- **Default:** `openrouter/google/gemini-pro`
- **Usage:** Used when the selected model fails

## How It Works

1. **Priority Order:**
   - User-entered API key (in the UI)
   - Environment variable API key
   - No key available (shows error)

2. **Visual Indicators:**
   - ✅ Green checkmark: Valid API key available
   - ❌ Red X: No valid API key
   - 🔵 "Using .env key" badge: Using environment variable

3. **Automatic Detection:**
   - The app automatically detects which API key to use based on the selected model
   - Gemini models → `VITE_GEMINI_API_KEY`
   - OpenRouter models → `VITE_OPENROUTER_API_KEY`
   - etc.

## Security Notes

- **Never commit your .env file** to version control
- **The .env file is already in .gitignore**
- **API keys are only used client-side** for direct API calls
- **No keys are sent to our servers**

## Troubleshooting

### "Please enter an API key" Error
- Check that your .env file exists and has the correct variable names
- Ensure the API key is valid and has sufficient credits
- Restart the development server after changing .env

### Model Not Working
- Verify the API key corresponds to the selected model
- Check if the model requires a different API key
- Try switching to a different model

### Environment Variables Not Loading
- Make sure variable names start with `VITE_`
- Restart the development server
- Check for typos in variable names
