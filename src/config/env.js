import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'DATABASE_URL'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  aiPromptVersion: process.env.AI_PROMPT_VERSION || 'v1',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 4000),
};
