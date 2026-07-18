import { createApp } from './app.js'
import { connectDB, disconnectDB } from './db.js'
import { config } from './config.js'
import { seedIfEmpty } from './seed.js'

async function main() {
  await connectDB()
  if (config.seedOnBoot) await seedIfEmpty()

  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(`🚀  Fable & Ink API listening on http://localhost:${config.port}`)
    console.log(`    CORS origins: ${config.corsOrigins.join(', ')}`)
  })

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down…`)
    server.close()
    await disconnectDB()
    process.exit(0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
