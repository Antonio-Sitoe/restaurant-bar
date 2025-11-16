// Schemas Swagger reutilizáveis para todas as rotas
export const swaggerSchemas = {
	customers: {
		getAll: {
			tags: ['Customers'],
			description: 'Listar todos os clientes',
		},
		getById: {
			tags: ['Customers'],
			description: 'Buscar cliente por ID',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		search: {
			tags: ['Customers'],
			description: 'Pesquisar clientes',
			querystring: {
				type: 'object',
				properties: { q: { type: 'string' } },
				required: ['q'],
			},
		},
		create: {
			tags: ['Customers'],
			description: 'Criar novo cliente',
		},
		update: {
			tags: ['Customers'],
			description: 'Atualizar cliente',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		delete: {
			tags: ['Customers'],
			description: 'Excluir cliente',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		history: {
			tags: ['Customers'],
			description: 'Histórico de compras do cliente',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
	},
	sales: {
		create: {
			tags: ['Sales'],
			description: 'Criar nova venda',
		},
		getAll: {
			tags: ['Sales'],
			description: 'Listar todas as vendas',
		},
		getById: {
			tags: ['Sales'],
			description: 'Buscar venda por ID',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		cancel: {
			tags: ['Sales'],
			description: 'Cancelar venda',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
			body: {
				type: 'object',
				properties: { reason: { type: 'string' } },
			},
		},
		receipt: {
			tags: ['Sales'],
			description: 'Gerar recibo da venda',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		hold: {
			tags: ['Sales'],
			description: 'Segurar venda temporariamente',
		},
		retrieveHold: {
			tags: ['Sales'],
			description: 'Recuperar venda segurada',
			params: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id'],
			},
		},
		dailySummary: {
			tags: ['Sales'],
			description: 'Resumo diário de vendas',
			querystring: {
				type: 'object',
				properties: { date: { type: 'string' } },
			},
		},
	},
	stock: {
		movement: {
			tags: ['Stock'],
			description: 'Adicionar movimentação de stock',
		},
		adjust: {
			tags: ['Stock'],
			description: 'Ajustar quantidade de stock',
		},
		history: {
			tags: ['Stock'],
			description: 'Histórico de movimentações',
			querystring: {
				type: 'object',
				properties: {
					productId: { type: 'string' },
					limit: { type: 'string' },
				},
			},
		},
		getCurrent: {
			tags: ['Stock'],
			description: 'Stock atual do produto',
			params: {
				type: 'object',
				properties: { productId: { type: 'string' } },
				required: ['productId'],
			},
		},
		inventory: {
			tags: ['Stock'],
			description: 'Realizar inventário',
			body: {
				type: 'object',
				properties: {
					counts: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								productId: { type: 'number' },
								quantity: { type: 'number' },
							},
						},
					},
				},
				required: ['counts'],
			},
		},
	},
	settings: {
		getAll: {
			tags: ['Settings'],
			description: 'Listar todas as configurações',
		},
		get: {
			tags: ['Settings'],
			description: 'Buscar configuração por chave',
			params: {
				type: 'object',
				properties: { key: { type: 'string' } },
				required: ['key'],
			},
		},
		update: {
			tags: ['Settings'],
			description: 'Atualizar configuração (requer admin)',
			params: {
				type: 'object',
				properties: { key: { type: 'string' } },
				required: ['key'],
			},
			body: {
				type: 'object',
				properties: { value: {} },
				required: ['value'],
			},
		},
		reset: {
			tags: ['Settings'],
			description: 'Resetar configurações (requer admin)',
		},
	},
	reports: {
		salesPeriod: {
			tags: ['Reports'],
			description: 'Relatório de vendas por período',
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
				required: ['startDate', 'endDate'],
			},
		},
		salesProduct: {
			tags: ['Reports'],
			description: 'Relatório de vendas por produto',
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
				required: ['startDate', 'endDate'],
			},
		},
		salesCategory: {
			tags: ['Reports'],
			description: 'Relatório de vendas por categoria',
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
				required: ['startDate', 'endDate'],
			},
		},
		salesPaymentMethod: {
			tags: ['Reports'],
			description: 'Relatório de vendas por método de pagamento',
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
				required: ['startDate', 'endDate'],
			},
		},
		profit: {
			tags: ['Reports'],
			description: 'Análise de lucro',
			querystring: {
				type: 'object',
				properties: {
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
				required: ['startDate', 'endDate'],
			},
		},
		stockValue: {
			tags: ['Reports'],
			description: 'Valor total do stock',
		},
		topProducts: {
			tags: ['Reports'],
			description: 'Produtos mais vendidos',
			querystring: {
				type: 'object',
				properties: {
					limit: { type: 'string' },
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
			},
		},
		exportPDF: {
			tags: ['Reports'],
			description: 'Exportar relatório em PDF',
			querystring: {
				type: 'object',
				properties: {
					type: { type: 'string' },
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
			},
		},
		exportExcel: {
			tags: ['Reports'],
			description: 'Exportar relatório em Excel',
			querystring: {
				type: 'object',
				properties: {
					type: { type: 'string' },
					startDate: { type: 'string' },
					endDate: { type: 'string' },
				},
			},
		},
	},
	system: {
		backup: {
			tags: ['System'],
			description: 'Criar backup (requer admin)',
		},
		restore: {
			tags: ['System'],
			description: 'Restaurar backup (requer admin)',
			body: {
				type: 'object',
				properties: {
					filePath: { type: 'string' },
				},
				required: ['filePath'],
			},
		},
		info: {
			tags: ['System'],
			description: 'Informações do sistema',
		},
		logs: {
			tags: ['System'],
			description: 'Obter logs do sistema (requer admin)',
		},
		backups: {
			tags: ['System'],
			description: 'Listar backups disponíveis (requer admin)',
		},
	},
}

