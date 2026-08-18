import { env } from '../config/env.js';

const PROMPT_TEMPLATE = `You are a senior backend architect.
Given a product idea, return:
1) backend architecture summary
2) data model suggestions
3) API design outline
4) deployment and observability checklist
Keep output concise and implementation-ready.`;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI provider timeout')), timeoutMs);
    }),
  ]);
}

function localFallback(idea) {
  return [
    `Architecture: Modular monolith with clear service boundaries for idea ${idea.title}.`,
    'Data model: User, Idea, BriefJob, AuditLog with indexed foreign keys.',
    'APIs: Auth endpoints, idea CRUD, async brief generation endpoint, job status endpoint.',
    'Ops: Dockerized service, health checks, structured logging, metrics and retry strategy.',
  ].join('\n');
}

async function openAiBrief(idea) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '.concat(env.openAiApiKey),
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: PROMPT_TEMPLATE },
        {
          role: 'user',
          content: `Title: ${idea.title}\nDescription: ${idea.description}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('AI provider returned empty content');
  }
  return content;
}

export async function generateBrief(idea) {
  if (!env.openAiApiKey) {
    return {
      content: localFallback(idea),
      source: 'fallback',
      promptVersion: env.aiPromptVersion,
    };
  }

  try {
    const content = await withTimeout(openAiBrief(idea), env.aiTimeoutMs);
    return {
      content,
      source: 'openai',
      promptVersion: env.aiPromptVersion,
    };
  } catch {
    return {
      content: localFallback(idea),
      source: 'fallback',
      promptVersion: env.aiPromptVersion,
    };
  }
}
