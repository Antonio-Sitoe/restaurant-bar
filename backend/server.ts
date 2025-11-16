import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { registerRoutes } from './routes/index'
import { errorHandler } from './middleware/error.middleware'
import { logger } from './utils/logger'
import { seedDatabase } from './db/seed'

const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '127.0.0.1'

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  })

  // Security
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Allow inline scripts for Electron
  })

  // CORS
  await fastify.register(cors, {
    origin: true, // Allow all origins for local development
    credentials: true,
  })

  // Swagger (OpenAPI) - DEVE ser registrado ANTES das rotas
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Restaurant POS API',
        description: 'API documentação do backend (Fastify) para o sistema POS',
        version: '1.0.0',
      },
      servers: [{ url: `http://${HOST}:${PORT}/api`, description: 'Local' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtido via /auth/login',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Autenticação e sessão' },
        { name: 'Users', description: 'Gestão de usuários' },
        { name: 'Products', description: 'Gestão de produtos' },
        { name: 'Categories', description: 'Gestão de categorias' },
        { name: 'Customers', description: 'Gestão de clientes' },
        { name: 'Sales', description: 'Vendas e operações' },
        { name: 'Stock', description: 'Stock e inventário' },
        { name: 'Settings', description: 'Configurações' },
        { name: 'Reports', description: 'Relatórios' },
        { name: 'System', description: 'Sistema e backups' },
      ],
    },
  })

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })

  // Error handler
  fastify.setErrorHandler(errorHandler)

  // Register routes
  await fastify.register(registerRoutes, { prefix: '/api' })

  return fastify
}

async function start() {
  try {
    // Seed database on startup
    await seedDatabase()

    const server = await buildServer()
    await server.listen({ port: PORT, host: HOST })
    logger.info(`Server listening on http://${HOST}:${PORT}`)
  } catch (err) {
    logger.error('Error starting server', err)
    process.exit(1)
  }
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start()
}

export { buildServer, start }
