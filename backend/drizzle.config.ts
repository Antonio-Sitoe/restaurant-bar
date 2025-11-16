import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema/**/*.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './backend/app.db',
  },
  strict: true,
  verbose: true,
} satisfies Config
