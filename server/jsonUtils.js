// Tolerant JSON extraction utilities
export function stripCodeFences(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/```(json|JSON)?/g, '```')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();
}

export function findFirstJson(text) {
  if (!text || typeof text !== 'string') return null;
  let start = -1;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{' || ch === '[') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = text.slice(start, i + 1);
        return candidate;
      }
    }
  }
  return null;
}

export function tolerantParseJson(raw) {
  if (raw == null) return { ok: false, error: 'empty' };
  let text = String(raw);
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {}

  try {
    text = stripCodeFences(text);
    return { ok: true, value: JSON.parse(text) };
  } catch {}

  const candidate = findFirstJson(text);
  if (candidate) {
    try {
      return { ok: true, value: JSON.parse(candidate) };
    } catch {}
  }

  // Last attempt: remove trailing commas
  try {
    const sanitized = text.replace(/,\s*(}|])/g, '$1');
    return { ok: true, value: JSON.parse(sanitized) };
  } catch (e) {
    return { ok: false, error: 'parse_failed' };
  }
}
