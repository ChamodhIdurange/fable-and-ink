// Database connection. Uses MONGO_URI when provided; otherwise spins up an
// in-memory MongoDB via mongodb-memory-server so the app runs with zero setup.

import mongoose from 'mongoose'
import { config } from './config.js'

let memoryServer: { stop: () => Promise<unknown> } | null = null

export async function connectDB(): Promise<string> {
  let uri = config.mongoUri

  if (!uri) {
    // Lazy import so production deployments that set MONGO_URI never pull in
    // the (heavy) in-memory server package at runtime.
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const mem = await MongoMemoryServer.create({ instance: { dbName: 'fable-ink' } })
    memoryServer = mem
    uri = mem.getUri('fable-ink')
    console.log('🧠  Started in-memory MongoDB (no MONGO_URI set)')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('🍃  Connected to MongoDB')
  return uri
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
  }
}
