import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { getDb } from './connection'
import { users } from './schema/users.schema'
import { settings } from './schema/settings.schema'
import { categories } from './schema/categories.schema'
import { createViews } from './views.js'

export async function seedDatabase() {
	const db = getDb()

	// Check if admin user already exists (by email or username)
	const existingAdminByEmail = await db.select().from(users).where(eq(users.email, 'admin@admin.com')).limit(1).all()
	const existingAdminByUsername = await db.select().from(users).where(eq(users.username, 'admin')).limit(1).all()

	if (existingAdminByEmail.length === 0 && existingAdminByUsername.length === 0) {
		// Create default admin user
		const passwordHash = await bcrypt.hash('12345678', 12)
		await db.insert(users).values({
			username: 'admin',
			passwordHash,
			fullName: 'Administrador',
			email: 'admin@admin.com',
			role: 'admin',
			isActive: true,
			createdAt: Date.now(),
		})
		console.log('✅ Default admin user created')
		console.log('   Email: admin@admin.com')
		console.log('   Password: 12345678')
	}

	// Seed default settings
	const defaultSettings = [
		{ key: 'store_name', value: 'Restaurant POS', type: 'string', category: 'general', description: 'Nome da loja' },
		{ key: 'store_address', value: '', type: 'string', category: 'general', description: 'Endereço da loja' },
		{ key: 'store_phone', value: '', type: 'string', category: 'general', description: 'Telefone da loja' },
		{ key: 'store_nuit', value: '', type: 'string', category: 'general', description: 'NUIT da loja' },
		{ key: 'tax_rate', value: '17', type: 'number', category: 'sales', description: 'Taxa de IVA padrão (%)' },
		{ key: 'currency', value: 'MT', type: 'string', category: 'general', description: 'Moeda' },
		{ key: 'auto_print_receipt', value: 'false', type: 'boolean', category: 'sales', description: 'Imprimir recibo automaticamente' },
	]

	for (const setting of defaultSettings) {
		const existing = await db.select().from(settings).where(eq(settings.key, setting.key)).limit(1).all()
		if (existing.length === 0) {
			await db.insert(settings).values({
				...setting,
				updatedAt: Date.now(),
			})
		}
	}

	// Seed default categories
	const defaultCategories = [
		{ name: 'Bebidas', description: 'Bebidas em geral', displayOrder: 1 },
		{ name: 'Comida', description: 'Alimentos', displayOrder: 2 },
		{ name: 'Snacks', description: 'Lanches e petiscos', displayOrder: 3 },
	]

	for (const category of defaultCategories) {
		const existing = await db.select().from(categories).where(eq(categories.name, category.name)).limit(1).all()
		if (existing.length === 0) {
			await db.insert(categories).values({
				...category,
				isActive: true,
				createdAt: Date.now(),
			})
		}
	}

	// Create database views
	await createViews()

	console.log('✅ Database seeded successfully')
}

