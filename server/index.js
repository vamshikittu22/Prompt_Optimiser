import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { tolerantParseJson } from './jsonUtils.js';

dotenv.config();

const app = express();

// CORS - adjust origin as needed
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin tools
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting per IP
const stylesLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const questionsLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const optimizeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

// Schemas
const providerEnum = z.enum(['gemini', 'openrouter']).optional();
const stylesSchema = z.object({
  provider: providerEnum,
  idea: z.string().min(1).max(8000),
  instructions: z.string().min(1).max(8000),
  selectedModel: z.string().optional(),
});

const questionsSchema = z.object({
  provider: providerEnum,
  idea: z.string().min(1).max(8000),
  instructions: z.string().min(1).max(8000),
  selectedModel: z.string().optional(),
});

const optimizeSchema = z.object({
  provider: providerEnum,
  idea: z.string().min(1).max(10000),
  instructions: z.string().min(1).max(10000),
  answeredQuestions: z.array(z.object({ text: z.string().min(1), answer: z.string().min(1) })).min(0).max(10).optional().default([]),
  appliedStyles: z.object({ primary: z.string().min(1), modifier: z.string().optional() }),
  selectedModels: z.array(z.string()).optional(),
});

// Sanitization helpers
function sanitizeText(s) {
  if (typeof s !== 'string') return '';
  let t = s.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/```/g, '``` ');
  t = t.replace(/\s+/g, ' ').trim();
  // Truncate to safe length
  if (t.length > 9000) t = t.slice(0, 9000);
  return t;
}

function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (out.idea) out.idea = sanitizeText(out.idea);
  if (out.instructions) out.instructions = sanitizeText(out.instructions);
  if (Array.isArray(out.answeredQuestions)) {
    out.answeredQuestions = out.answeredQuestions.map(q => ({
      text: sanitizeText(q.text),
      answer: sanitizeText(q.answer),
    }));
  }
  if (out.appliedStyles) {
    out.appliedStyles = {
      primary: sanitizeText(out.appliedStyles.primary),
      modifier: out.appliedStyles.modifier ? sanitizeText(out.appliedStyles.modifier) : undefined,
    };
  }
  return out;
}

// Provider clients
async function callGemini(systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiBase = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
  if (!apiKey) throw new Error('provider_unavailable');

  const url = `${apiBase}/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  const body = { contents: [{ parts: [{ text: systemPrompt }]}] };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(id);
    if (!resp.ok) throw new Error('provider_unavailable');
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return String(text);
  } catch (e) {
    clearTimeout(id);
    throw new Error(e.name === 'AbortError' ? 'timeout' : 'provider_unavailable');
  }
}

async function callOpenRouter(systemPrompt, model) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('provider_unavailable');
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const body = {
    model: model || 'mistralai/mistral-7b-instruct:free',
    messages: [
      { role: 'system', content: 'You are a precise JSON-only generator.' },
      { role: 'user', content: systemPrompt }
    ],
    response_format: { type: 'json_object' }
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(body), signal: controller.signal });
    clearTimeout(id);
    if (!resp.ok) throw new Error('provider_unavailable');
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return String(text);
  } catch (e) {
    clearTimeout(id);
    throw new Error(e.name === 'AbortError' ? 'timeout' : 'provider_unavailable');
  }
}

// Prompts
function stylesSystemPrompt({ idea, instructions }) {
  return `You are a professional prompt engineer. Analyze the user's idea and instructions, then recommend the 2-3 most relevant prompting styles from this list:

[Instruction-based, Role/Persona, Format-Constrained, Few-shot, Zero-shot, Chain-of-Thought, Socratic, Storytelling, Roleplay, Hypothetical, Critique & Improve, Iterative Refinement]

For each recommended style, provide id, name, explanation (1-2 sentences), and a short example specific to the user's idea.
Respond with EXACT JSON only matching:
{ "status": "success", "suggestedStyles": [{"id":"string","name":"string","explanation":"string","example":"string"}] }

User's Instructions: ${instructions}
User's Idea: ${idea}`;
}

function questionsSystemPrompt({ idea, instructions }) {
  return `You are a professional prompt engineer. Generate 2-5 highly specific clarifying questions tailored to the user's idea and instructions.
Each question must include a short text and 4-6 multiple-choice options.
Respond with EXACT JSON only matching:
{ "status": "success", "clarifyingQuestions": [{"text":"string","options":["string"]}] }

User's Instructions: ${instructions}
User's Idea: ${idea}`;
}

function optimizeSystemPrompt({ idea, instructions, answeredQuestions, appliedStyles }) {
  const answers = (answeredQuestions || []).map(q => `Q: ${q.text}\nA: ${q.answer}`).join('\n');
  return `You are a senior prompt engineer. Create one final optimized prompt as a single fenced code block that combines:
- Role, Task, Context
- Constraints, Tone, Audience, Format
- Application of primary and optional modifier styles
- Mandatory keywords/details from answers

Respond with EXACT JSON only matching:
{ "status": "success", "optimizedPrompt": "\`\`\`<language>\n<final prompt text>\n\`\`\`", "appliedStyles": ["string"] }

Primary style: ${appliedStyles?.primary || ''}
Modifier style: ${appliedStyles?.modifier || ''}
Instructions: ${instructions}
Idea: ${idea}
Answers:\n${answers}`;
}

function fallbackStyles() {
  return {
    status: 'success',
    suggestedStyles: [
      { id: 'instruction', name: 'Instruction-based', explanation: 'Direct, explicit instructions to guide the model.', example: 'Write a step-by-step guide to ...' },
      { id: 'role', name: 'Role/Persona', explanation: 'Assign the model a specific role for targeted output.', example: 'You are a veteran UI designer ...' },
      { id: 'format', name: 'Format-Constrained', explanation: 'Define strict output format for consistency.', example: 'Respond only in JSON with fields ...' },
    ],
  };
}

function fallbackQuestions() {
  return {
    status: 'success',
    clarifyingQuestions: [
      { text: 'Who is the target audience?', options: ['General', 'Technical', 'Executives', 'Students'] },
      { text: 'What tone should be used?', options: ['Professional', 'Friendly', 'Persuasive', 'Neutral'] },
      { text: 'Any mandatory constraints?', options: ['Length limit', 'Formatting', 'Keywords', 'Citations'] },
    ],
  };
}

function fallbackOptimize({ idea, instructions, appliedStyles }) {
  const body = `You are ${appliedStyles?.primary || 'a helpful assistant'}.
Task: Optimize the following idea using the provided instructions.
Context: Ensure clarity, structure, and actionable steps.
Constraints: Keep it concise and specific.
Audience: General.
Format: Clear sections with bullet points.

Idea: ${idea}
Instructions: ${instructions}`;
  return {
    status: 'success',
    optimizedPrompt: '```text\n' + body + '\n```',
    appliedStyles: [appliedStyles?.primary, appliedStyles?.modifier].filter(Boolean),
  };
}

async function handleProvider({ provider, systemPrompt, selectedModel }) {
  const prefer = provider || (process.env.DEFAULT_PROVIDER || 'gemini');
  if (prefer === 'openrouter') {
    const raw = await callOpenRouter(systemPrompt, selectedModel);
    return raw;
  }
  const raw = await callGemini(systemPrompt);
  return raw;
}

function robustJsonResponse(raw, fallback) {
  const parsed = tolerantParseJson(raw);
  if (parsed.ok && parsed.value && typeof parsed.value === 'object') {
    return parsed.value;
  }
  return fallback;
}

app.post('/api/styles', stylesLimiter, async (req, res) => {
  try {
    const input = stylesSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ status: 'error', error: 'invalid_payload' });
    const payload = sanitizePayload(input.data);
    const systemPrompt = stylesSystemPrompt(payload);
    let raw = '';
    try {
      raw = await handleProvider({ provider: payload.provider, systemPrompt, selectedModel: payload.selectedModel });
    } catch (e) {
      if (e.message === 'timeout') return res.status(504).json({ status: 'error', error: 'timeout' });
      return res.status(502).json({ status: 'error', error: 'provider_unavailable' });
    }
    const json = robustJsonResponse(raw, fallbackStyles());
    return res.json(json);
  } catch {
    return res.status(500).json({ status: 'error', error: 'internal_error' });
  }
});

app.post('/api/questions', questionsLimiter, async (req, res) => {
  try {
    const input = questionsSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ status: 'error', error: 'invalid_payload' });
    const payload = sanitizePayload(input.data);
    const systemPrompt = questionsSystemPrompt(payload);
    let raw = '';
    try {
      raw = await handleProvider({ provider: payload.provider, systemPrompt, selectedModel: payload.selectedModel });
    } catch (e) {
      if (e.message === 'timeout') return res.status(504).json({ status: 'error', error: 'timeout' });
      return res.status(502).json({ status: 'error', error: 'provider_unavailable' });
    }
    const json = robustJsonResponse(raw, fallbackQuestions());
    // normalize count to 2-5
    if (Array.isArray(json.clarifyingQuestions)) {
      if (json.clarifyingQuestions.length < 2) {
        json.clarifyingQuestions = fallbackQuestions().clarifyingQuestions;
      } else if (json.clarifyingQuestions.length > 5) {
        json.clarifyingQuestions = json.clarifyingQuestions.slice(0, 5);
      }
    }
    return res.json(json);
  } catch {
    return res.status(500).json({ status: 'error', error: 'internal_error' });
  }
});

app.post('/api/optimize', optimizeLimiter, async (req, res) => {
  try {
    const input = optimizeSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ status: 'error', error: 'invalid_payload' });
    const payload = sanitizePayload(input.data);
    const systemPrompt = optimizeSystemPrompt(payload);
    let raw = '';
    try {
      raw = await handleProvider({ provider: payload.provider, systemPrompt, selectedModel: (payload.selectedModels || [])[0] });
    } catch (e) {
      if (e.message === 'timeout') return res.status(504).json({ status: 'error', error: 'timeout' });
      return res.status(502).json({ status: 'error', error: 'provider_unavailable' });
    }
    const json = robustJsonResponse(raw, fallbackOptimize(payload));
    return res.json(json);
  } catch {
    return res.status(500).json({ status: 'error', error: 'internal_error' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
