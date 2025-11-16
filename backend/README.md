# Backend - Sistema POS

Backend do sistema POS desenvolvido para rodar localmente usando Fastify HTTP server.

## Estrutura

```
/backend
  /db
    /schema          # Schemas Drizzle ORM
    connection.ts    # Conexão com SQLite
    drizzle.config.ts
    seed.ts          # Dados iniciais
  /services          # Lógica de negócio
  /routes            # Rotas Fastify HTTP
  /middleware        # Middleware (auth, errors)
  /utils             # Utilitários (logger, errors, validators)
  /types             # Tipos TypeScript compartilhados
  server.ts          # Entry point do servidor
```

## Instalação

```bash
npm install
```

## Executar

```bash
# Desenvolvimento (com watch)
npm run dev

# Produção
npm run build
npm start
```

## Configuração

Variáveis de ambiente (opcional):

- `PORT` - Porta do servidor (padrão: 3000)
- `HOST` - Host do servidor (padrão: 127.0.0.1)
- `DB_PATH` - Caminho do banco de dados SQLite (padrão: ./app.db)
- `BACKUP_DIR` - Diretório de backups (padrão: ./backups)
- `LOG_DIR` - Diretório de logs (padrão: ./logs)
- `NODE_ENV` - Ambiente (development/production)

## Rotas da API

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Produtos

- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `GET /api/products/barcode/:barcode` - Buscar por código de barras
- `GET /api/products/search?q=...` - Pesquisar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Excluir produto
- `GET /api/products/low-stock` - Produtos com stock baixo
- `GET /api/products/top-selling` - Produtos mais vendidos

### Categorias

- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Excluir categoria
- `POST /api/categories/reorder` - Reordenar categorias

### Clientes

- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Buscar cliente por ID
- `GET /api/customers/search?q=...` - Pesquisar clientes
- `POST /api/customers` - Criar cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Excluir cliente
- `GET /api/customers/:id/history` - Histórico de compras

### Vendas

- `POST /api/sales` - Criar venda
- `GET /api/sales` - Listar vendas
- `GET /api/sales/:id` - Detalhes da venda
- `POST /api/sales/:id/cancel` - Cancelar venda
- `GET /api/sales/:id/receipt` - Gerar recibo
- `POST /api/sales/hold` - Suspender venda
- `GET /api/sales/hold/:id` - Recuperar venda suspensa
- `GET /api/sales/daily-summary` - Resumo diário

### Stock

- `POST /api/stock/movement` - Adicionar movimentação
- `POST /api/stock/adjust` - Ajuste manual
- `GET /api/stock/history` - Histórico de movimentações
- `GET /api/stock/:productId` - Stock atual
- `POST /api/stock/inventory` - Inventário físico

### Relatórios

- `GET /api/reports/sales/period?startDate=&endDate=` - Vendas por período
- `GET /api/reports/sales/product?startDate=&endDate=` - Vendas por produto
- `GET /api/reports/sales/category?startDate=&endDate=` - Vendas por categoria
- `GET /api/reports/sales/payment-method?startDate=&endDate=` - Vendas por método de pagamento
- `GET /api/reports/profit?startDate=&endDate=` - Análise de lucro
- `GET /api/reports/stock-value` - Valor do stock
- `GET /api/reports/top-products?limit=10` - Top produtos

### Sistema

- `POST /api/system/backup` - Criar backup (admin)
- `POST /api/system/restore` - Restaurar backup (admin)
- `GET /api/system/info` - Informações do sistema
- `GET /api/system/logs` - Buscar logs (admin)
- `GET /api/system/backups` - Listar backups (admin)

## Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem autenticação via Bearer token:

```
Authorization: Bearer <token>
```

## Resposta Padrão

Todas as rotas retornam no formato:

```json
{
  "success": true,
  "data": { ... }
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

## Scripts

```bash
# Gerar migrações
npm run db:generate

# Executar migrações
npm run db:migrate

# Abrir Drizzle Studio
npm run db:studio
```

## Logs

Os logs são salvos em `{LOG_DIR}/app-{date}.log` com rotação automática.

## Backups

Os backups são salvos em `{BACKUP_DIR}/backup-{timestamp}.db.gz` com compressão gzip e checksum SHA256.
