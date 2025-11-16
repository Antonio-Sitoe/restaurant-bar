import { eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { settings, type Setting, type NewSetting } from '../db/schema/settings.schema'

export const settingService = {
	async getAll(): Promise<Setting[]> {
		return await db.select().from(settings).all()
	},

	async get(key: string): Promise<Setting | null> {
		return await db.select().from(settings).where(eq(settings.key, key)).get() ?? null
	},

	async getValue<T = string>(key: string, defaultValue?: T): Promise<T> {
		const setting = await this.get(key)
		if (!setting) return defaultValue as T

		try {
			if (setting.type === 'json') {
				return JSON.parse(setting.value) as T
			}
			if (setting.type === 'number') {
				return Number(setting.value) as T
			}
			if (setting.type === 'boolean') {
				return (setting.value === 'true') as T
			}
			return setting.value as T
		} catch {
			return defaultValue as T
		}
	},

	async set(key: string, value: string | number | boolean | object, options?: { type?: string; category?: string; description?: string }): Promise<Setting> {
		const existing = await this.get(key)

		const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
		const type = options?.type ?? (typeof value === 'object' ? 'json' : typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string')

		if (existing) {
			const result = await db
				.update(settings)
				.set({
					value: stringValue,
					type,
					category: options?.category ?? existing.category,
					description: options?.description ?? existing.description,
					updatedAt: Date.now(),
				})
				.where(eq(settings.key, key))
				.returning()
				.get()
			return result
		} else {
			const newSetting: NewSetting = {
				key,
				value: stringValue,
				type,
				category: options?.category ?? null,
				description: options?.description ?? null,
				updatedAt: Date.now(),
			}
			const result = await db.insert(settings).values(newSetting).returning().get()
			return result
		}
	},

	async update(key: string, updates: Partial<Pick<Setting, 'value' | 'type' | 'category' | 'description'>>): Promise<Setting> {
		const result = await db
			.update(settings)
			.set({ ...updates, updatedAt: Date.now() })
			.where(eq(settings.key, key))
			.returning()
			.get()
		return result
	},
	async reset(): Promise<void> {
		// Implement as needed; for now, no-op to satisfy route
		return
	},
}

