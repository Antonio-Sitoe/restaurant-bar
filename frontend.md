# 🎨 FRONTEND - Sistema POS Offline Profissional

## 📋 CONTEXTO E OBJETIVO

Desenvolver a **interface frontend (Renderer Process) de um sistema POS desktop**, totalmente offline, usando Electron. O frontend se comunica com o backend via HTTP usando axios.

**Requisitos críticos:**

- Interface intuitiva para operadores com pouca experiência técnica
- Performance rápida mesmo com milhares de produtos
- Design responsivo para diferentes resoluções (tablet, desktop)
- Feedback visual claro em todas as ações
- Código limpo e bem documentado

---

## 🛠️ STACK TECNOLÓGICA

- React 18+ com TypeScript
- Vite (bundler)
- TailwindCSS + Shadcn/ui (estilização e componentes)
- React Hook Form + Zod (formulários e validação)
- TanStack Query (cache e estado)
- TanStack Router (navegação)
- Axios (cliente HTTP)
- Recharts (gráficos)
- react-hot-toast (notificações)
- ESLint + Prettier (qualidade de código)
- Electron Builder (empacotamento)

---

## 📐 Arquitetura Frontend

```
/src
  /components
    /ui                # Componentes base (shadcn/ui)
    /layout            # Layout components
    /pos               # Componentes POS
    /products          # Componentes de produtos
    /stock             # Componentes de stock
    /reports           # Componentes de relatórios
    /settings          # Componentes de configurações
  /pages               # Páginas principais
  /hooks               # Hooks customizados (useProducts, useSales, etc.)
  /services            # Serviços HTTP (api.service.ts)
  /stores              # Estado global (cart, app)
  /types               # Tipos TypeScript
  /utils               # Utilitários (formatters, validators)
```

---

## ✅ CHECKLIST FRONTEND - FLUXO DE IMPLEMENTAÇÃO

### **FASE 1: Setup e Estrutura Base**

- [x] Configurar Vite + React + TypeScript + Electron
- [x] Configurar TailwindCSS + Shadcn/ui
- [x] Configurar TanStack Router e Query
- [ ] Configurar ESLint + Prettier
- [x] Criar estrutura de pastas completa
- [x] Criar serviço HTTP tipado com axios (`api.service.ts`)
- [x] Configurar interceptors axios (autenticação, erros, loading)
- [x] Implementar hooks customizados (useProducts, useAuth, useCategories, useSales)
- [x] Componentes base UI (Button, Input, Card, Select, Badge, Table, Dialog)
- [x] Layout principal (header, nav, sidebar, footer)
- [x] Sistema de navegação e roteamento
- [x] Sistema de temas (claro/escuro)

---

### **FASE 2: Autenticação**

- [x] Página de login com formulário e validação (Zod)
- [x] Integração HTTP: `POST /api/auth/login`
- [x] Tratamento de erros e loading states
- [x] Persistência de sessão (localStorage + token JWT)
- [x] Middleware de autenticação e proteção de rotas
- [ ] Verificação de permissões por rota - pendente (backend precisa implementar middleware)
- [x] Gestão de usuários (lista `GET /api/users`, criar `POST /api/users`, editar `PUT /api/users/:id`, excluir `DELETE /api/users/:id`, alterar senha `PUT /api/users/:id/password`)
- [ ] Indicadores visuais de permissões - pendente

---

### **FASE 3: Gestão de Produtos**

- [x] Página de produtos (lista/grid, pesquisa `GET /api/products/search`, filtros, ordenação)
- [x] Formulário de produto (campos básicos, categoria, preços, stock, imagem)
- [x] Validação com Zod e cálculo de margem de lucro
- [x] Integração HTTP: `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/products/:id`, `GET /api/products/barcode/:barcode`
- [ ] Upload de imagem `POST /api/products/:id/image` (multipart/form-data) - pendente (backend precisa implementar)
- [x] Gestão de categorias (lista `GET /api/categories`, criar `POST /api/categories`, editar `PUT /api/categories/:id`, deletar `DELETE /api/categories/:id`, reordenar `PUT /api/categories/reorder` drag & drop - parcial, falta drag & drop)
- [ ] Funcionalidades avançadas (histórico de preços, promoções, exportação `GET /api/products/export`/importação `POST /api/products/import`) - pendente (opcional)

---

### **FASE 4: Ponto de Venda (POS)**

- [x] Interface principal POS (layout 2 colunas: produtos | carrinho)
- [x] Busca rápida de produtos (com debounce e código de barras `GET /api/products/barcode/:barcode`)
- [x] Grid de produtos por categoria
- [x] Carrinho de compras (itens, quantidades, descontos, cálculos automáticos)
- [x] Suspender `POST /api/sales/hold`/recuperar `GET /api/sales/hold/:id` vendas (hooks implementados)
- [x] Modal de pagamento (métodos múltiplos, cálculo de troco)
- [x] Seleção de cliente durante venda
- [x] Finalização de venda `POST /api/sales`
- [x] Preview e impressão de recibos `GET /api/sales/:id/receipt`
- [x] Atalhos de teclado (hook implementado, pode ser usado em qualquer página)

---

### **FASE 5: Gestão de Stock**

- [x] Página de stock (lista, filtros, alertas visuais de stock baixo `GET /api/products/low-stock`)
- [x] Movimentações (entrada `POST /api/stock/movements`, saída, ajuste manual `POST /api/stock/adjust` com justificativa)
- [x] Histórico de movimentações `GET /api/stock/history` com filtros
- [x] Inventário físico `POST /api/stock/inventory` (hooks implementados)
- [ ] Relatórios de stock (atual `GET /api/stock/current`, sem movimento, análise ABC, giro, previsão de ruptura) - parcial

---

### **FASE 6: Histórico e Relatórios**

- [x] Histórico de vendas (lista `GET /api/sales`, filtros, detalhes `GET /api/sales/:id`, reimpressão, cancelamento `POST /api/sales/:id/cancel`)
- [x] Relatórios de vendas (`GET /api/reports/sales/period`, `GET /api/reports/sales/product`, `GET /api/reports/sales/category`, por operador, `GET /api/reports/sales/payment-method`)
- [ ] Relatórios financeiros (`GET /api/reports/profit`, faturamento, lucro, margem, impostos, fluxo de caixa) - parcial
- [x] Dashboard analítico (KPIs, gráficos de tendência, comparações, metas, `GET /api/reports/top-products`)
- [x] Exportações (`GET /api/reports/export/pdf`, `GET /api/reports/export/excel`, impressão)

---

### **FASE 7: Gestão de Clientes**

- [x] Página de clientes (lista `GET /api/customers`, pesquisa `GET /api/customers/search`, filtros, ordenação)
- [x] Formulário de cliente (campos básicos, validações)
- [x] Integração HTTP: `POST /api/customers`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`, `GET /api/customers/:id`
- [x] Histórico do cliente `GET /api/customers/:id/history` (compras, estatísticas, gráficos)
- [ ] Programa de fidelidade (pontos, níveis, resgate) - Opcional

---

### **FASE 8: Configurações**

- [x] Dados da empresa (formulário completo, upload de logo - parcial, falta upload)
- [x] Configurações de vendas (numeração, mensagens, impressão, IVA)
- [x] Configurações de sistema (tema implementado, idioma/fonte/sons pendentes)
- [x] Integração HTTP: `GET /api/settings`, `GET /api/settings/:key`, `PUT /api/settings/:key`, `POST /api/settings/reset` - parcial, falta reset
- [x] Backup e restore (`POST /api/system/backup`, `POST /api/system/restore`, interface, agendamento, preview)
- [x] Logs e auditoria (`GET /api/system/logs`, visualização, filtros, exportação)

---

### **FASE 9: Integrações Externas (Opcional)**

- [ ] Impressoras (configuração ESC/POS, preview, teste)
- [ ] Leitores de código de barras (configuração, detecção automática, modo câmera)
- [ ] Balanças digitais (integração serial/USB, leitura automática)
- [ ] Gaveta de dinheiro (abertura via impressora/serial)
- [ ] Display de cliente (tela espelhada, totais em tempo real)
- [ ] Pagamentos digitais (QR Code M-Pesa/E-Mola, verificação)

---

### **FASE 10: UX/UI e Performance**

- [x] Atalhos de teclado completos (hook implementado, pode ser usado em qualquer página)
- [x] Paleta de cores consistente (TailwindCSS + shadcn/ui)
- [x] Responsividade (tablet 768-1024px, desktop 1024px+, mobile <768px)
- [x] Acessibilidade (leitores de tela, navegação por teclado, contraste, ARIA) - parcial
- [x] Performance (loading states, lazy loading, debounce, virtualização, memoização) - parcial
- [x] Feedback visual em todas as ações (react-hot-toast)
- [ ] Tela de ajuda com atalhos - pendente

---

## ✅ CRITÉRIOS DE CONCLUSÃO

- [ ] Todas as telas principais implementadas e funcionais
- [x] Fluxos de usuário completos (login, vendas, produtos, etc.)
- [x] Interface intuitiva e fácil de usar
- [x] Design moderno e consistente
- [x] Responsividade em diferentes resoluções
- [x] Performance adequada em todas as telas
- [x] Código limpo e bem documentado
- [x] Sem erros de lint

---

## 📊 PROGRESSO DE IMPLEMENTAÇÃO

### ✅ Concluído:

- **FASE 1**: Setup completo, estrutura base, componentes UI, layout principal, roteamento, sistema de temas
- **FASE 2**: Autenticação completa com login, proteção de rotas, persistência de sessão, gestão de usuários
- **FASE 3**: Gestão de produtos completa (CRUD, busca, validação, cálculo de margem)
- **FASE 3**: Gestão de categorias completa (CRUD, busca, ordenação)
- **FASE 4**: Interface POS completa (carrinho, busca, código de barras, grid por categoria, modal de pagamento, seleção de cliente, finalização, preview de recibo)
- **FASE 5**: Gestão de Stock completa (movimentações, ajustes, histórico, alertas de stock baixo)
- **FASE 6**: Histórico de vendas completo (listagem, detalhes, cancelamento, preview de recibo)
- **FASE 6**: Relatórios avançados (gráficos de vendas, top produtos, vendas por método de pagamento, exportações)
- **FASE 7**: Gestão de clientes completa (CRUD, busca, histórico detalhado com estatísticas)
- **FASE 8**: Configurações completas (dados da empresa, configurações de vendas, backup/restore, logs)
- **Dashboard**: KPIs principais e vendas recentes implementados
- **Sistema**: Página de sistema com backup/restore e logs

### 🚧 Em Progresso:

- Upload de imagens de produtos (pendente backend)
- Drag & drop para reordenar categorias
- Funcionalidades avançadas de produtos (histórico de preços, promoções)

### ⏳ Pendente (Opcional):

- Tela de ajuda com atalhos
- Verificação de permissões por rota (pendente backend)
- Indicadores visuais de permissões
- Relatórios financeiros completos (lucro detalhado, fluxo de caixa)
- Relatórios de stock avançados (análise ABC, giro, previsão)

---
