export default {
  schema: './db/schema/**/*.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_PATH || './app.db',
  },
  strict: true,
  verbose: true,
}

