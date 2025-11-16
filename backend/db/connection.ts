import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema/index'

const databaseUrl = process.env.DATABASE_URL || 'file:./app.db'

const client = createClient({
  url: databaseUrl,
})

export const db = drizzle(client, { schema })

export { client }
