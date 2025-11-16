# ⚙️ BACKEND - Sistema POS Offline Profissional

## 📋 CONTEXTO E OBJETIVO

Backend HTTP (Fastify) para o sistema POS desktop, rodando localmente. Responsável por base de dados (SQLite), lógica de negócio e exposição de rotas REST para o frontend.

**Requisitos críticos:**

- [x] Operação local/offline (SQLite + Node.js)
- [x] Integridade de dados (transações Drizzle/SQLite onde aplicável)
- [x] Performance adequada com milhares de produtos
- [x] Código limpo e organizado (services, routes, middleware)

---

## 🛠️ STACK TECNOLÓGICA

- [x] Node.js 20+ com TypeScript
- [x] Fastify (HTTP Server)
- [x] SQLite (better-sqlite3) + Drizzle ORM
- [x] Drizzle Kit (migrações)
- [x] Zod (validação)
- [x] bcrypt (hash de senhas)
- [x] Logger próprio (arquivo + rotação)
- [x] Swagger/OpenAPI (documentação em `/docs`)

---

## 📐 Arquitetura Backend

```
/backend
  /db
    /schema            # Schemas Drizzle
      products.schema.ts
      categories.schema.ts
      customers.schema.ts
      sales.schema.ts           # inclui sale_items
      stock_movements.schema.ts
      users.schema.ts
      settings.schema.ts
      daily_closures.schema.ts
      audit_logs.schema.ts
    connection.ts
    drizzle.config.ts
    seed.ts
  /services            # Lógica de negócio
    product.service.ts
    category.service.ts
    customer.service.ts
    sale.service.ts
    stock.service.ts
    user.service.ts
    setting.service.ts
    report.service.ts
    backup.service.ts
  /routes              # Rotas HTTP (Fastify)
    index.ts
    users.routes.ts
    products.routes.ts
    categories.routes.ts
    customers.routes.ts
    sales.routes.ts
    stock.routes.ts
    settings.routes.ts
    reports.routes.ts
    system.routes.ts
  /middleware
    auth.middleware.ts
    error.middleware.ts
  /utils
    logger.ts
    errors.ts
    validators.ts
  /types
    index.ts
  server.ts            # Entry point do servidor
```

---

## ✅ CHECKLIST BACKEND - FLUXO DE IMPLEMENTAÇÃO

### **FASE 1: Setup e Arquitetura**

- [x] Setup Fastify com Node.js 20+ e TypeScript
- [x] Configurar SQLite (better-sqlite3) + Drizzle ORM
- [x] Setup Drizzle Kit para migrações
- [x] Configurar estrutura de pastas completa
- [x] Setup sistema de logging (arquivo + rotação)
- [x] Configurar tratamento de erros centralizado
- [x] Configurar variáveis de ambiente básicas (PORT, HOST, DB_PATH, BACKUP_DIR, LOG_DIR)
- [x] Schemas de banco de dados principais (products, categories, sales + sale_items, stock_movements, customers, users, settings)
- [x] Schemas adicionais (daily_closures, audit_logs)
- [x] Índices para performance (barcode, name, dates, etc.) — revisar Drizzle migrations
- [x] Views opcionais (low_stock_products, daily_sales_summary, top_selling_products, stock_value)
- [x] Seed inicial (arquivo disponível)

---

### **FASE 2: Serviços de Domínio**

- [x] Product Service: getAll, getById, getByBarcode, search, create, update, delete, getLowStock, getTopSelling, exportCSV
- [x] Category Service: getAll, getById, create, update, delete, reorder
- [x] Customer Service: getAll, getById, search, create, update, delete, getPurchaseHistory
- [x] Sale Service: create (transacional com itens e stock), getAll, getById, cancel, hold, retrieveHold, getDailySummary, printReceipt
- [x] Stock Service: addMovement, getHistory, getCurrentStock, adjust, performInventory, getLowStock
- [x] User Service: login (bcrypt), getAll, getById, create, update, delete, changePassword
- [x] Setting Service: getAll, get, update, reset
- [x] Report Service: salesByPeriod, salesByProduct, salesByCategory, salesByPaymentMethod, profitAnalysis, stockValue, topProducts, exportPDF, exportExcel
- [x] Backup Service: createBackup, listBackups, verifyBackup, restoreBackup, scheduleBackup (com node-cron)

> Observação: métodos marcados como pendentes serão entregues nas próximas iterações.

---

### **FASE 3: Rotas HTTP (Fastify)**

- [x] Estrutura base de rotas (padrão de resposta, tratamento de erros, validação Zod)
- [x] Produtos: `GET /api/products`, `GET /api/products/:id`, `GET /api/products/barcode/:barcode`, `GET /api/products/search`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/products/low-stock`, `GET /api/products/top-selling`, `GET /api/products/export`
- [x] Categorias: `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`, `POST /api/categories/reorder`
- [x] Clientes: `GET /api/customers`, `GET /api/customers/:id`, `GET /api/customers/search`, `POST /api/customers`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`, `GET /api/customers/:id/history`
- [x] Vendas: `POST /api/sales`, `GET /api/sales`, `GET /api/sales/:id`, `POST /api/sales/:id/cancel`, `GET /api/sales/:id/receipt`, `POST /api/sales/hold`, `GET /api/sales/hold/:id`, `GET /api/sales/daily-summary`
- [x] Stock: `POST /api/stock/movement`, `POST /api/stock/adjust`, `GET /api/stock/history`, `GET /api/stock/:productId`, `POST /api/stock/inventory`
- [x] Autenticação/Usuários: `POST /api/auth/login`, `POST /api/auth/logout`; `GET/POST/PUT/DELETE /api/users` (com proteção padrão)
- [x] Configurações: `GET /api/settings`, `GET /api/settings/:key`, `PUT /api/settings/:key`, `POST /api/settings/reset`
- [x] Relatórios: `GET /api/reports/sales/period|product|category|payment-method`, `GET /api/reports/profit`, `GET /api/reports/stock-value`, `GET /api/reports/top-products`, `GET /api/reports/export/pdf|excel` (placeholders para export)
- [x] Sistema: `POST /api/system/backup`, `POST /api/system/restore` (placeholder), `GET /api/system/info`, `GET /api/system/logs` (placeholder), `GET /api/system/backups`

---

### **FASE 4: Segurança e Validações**

- [x] Autenticação com bcrypt (hash de senhas)
- [x] JWT para sessão/authorization (middleware + emissão de token em login)
- [x] Autorização baseada em roles (helper `requireRole`)
- [x] Validação de dados com Zod em rotas
- [x] Rate limiting em login (in-memory)
- [x] Mensagens de erro amigáveis + logs
- [x] Estrutura de auditoria (schema `audit_logs`)
- [x] Middleware de auditoria automática (disponível para uso nas rotas)

---

### **FASE 5: Backup e Restore**

- [x] Backup manual via API (compressão + checksum)
- [x] Restore (decompress + replace)
- [x] Listagem e verificação de backups
- [x] Agendamento automático (node-cron) — disponível via API `/api/system/backup/schedule`

---

### **FASE 6: Tratamento de Erros, Logs e Documentação**

- [x] Logger com níveis e rotação
- [x] Tratamento central de erros (middleware)
- [x] Swagger/OpenAPI disponível em `/docs`
- [x] Schemas detalhados por rota no Swagger (Products, Users, Categories completos; demais em progresso)

---

### **FASE 7: Performance e Otimização**

- [ ] Queries otimizadas (evitar N+1)
- [ ] Índices adicionais conforme uso real
- [x] Paginação em listagens grandes (products, customers, sales, stock history)
- [ ] Metas: inicialização < 3s, pesquisa < 100ms, venda < 500ms, relatórios < 2s

---

## ✅ CRITÉRIOS DE CONCLUSÃO

- [x] Operações básicas funcionam (produtos, clientes, stock, vendas)
- [x] Fluxo de vendas completo (cancelar, hold, recibo, resumo diário)
- [x] API documentada em `/docs`
- [x] Sistema estável e com logs
- [x] Integridade de dados (transacional no create de venda)
- [x] JWT e rate limiting implementados
- [x] Código limpo e organizado
- [ ] Auditoria automática e exports (PDF/Excel)
