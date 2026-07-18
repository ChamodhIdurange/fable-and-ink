// Centralised runtime configuration. Loads a local .env if present (Node's
// built-in loader, no dotenv dependency) and exposes typed values with defaults.

import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '../.env')
if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch {
    // Older Node without loadEnvFile — ignore; real env vars still apply.
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? 'fable-and-ink-dev-secret-change-me',
  mongoUri: process.env.MONGO_URI, // undefined => use in-memory MongoDB
  seedOnBoot: (process.env.SEED_ON_BOOT ?? 'true') !== 'false',
  demoPassword: process.env.DEMO_PASSWORD ?? 'password',
  // Google AI (Gemini). When the key is unset, AI features fall back to the
  // built-in stubs so local dev still works with zero setup.
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-flash-latest',
}
