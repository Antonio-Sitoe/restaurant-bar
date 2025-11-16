import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/connection'
import { users, type User, type NewUser } from '../db/schema/users.schema'

export interface LoginCredentials {
	username: string
	password: string
}

export interface CreateUserInput {
	username: string
	password: string
	fullName: string
	email?: string
	role: 'admin' | 'manager' | 'cashier'
	permissions?: string[]
}

export const userService = {
	async login(credentials: LoginCredentials): Promise<User | null> {
		const db = getDb()
		// Try to find user by username or email
		let user = await db.select().from(users).where(eq(users.username, credentials.username)).get()
		
		// If not found by username, try by email
		if (!user && credentials.username.includes('@')) {
			user = await db.select().from(users).where(eq(users.email, credentials.username)).get()
		}

		if (!user || !user.isActive) {
			return null
		}

		const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
		if (!isValid) {
			return null
		}

		// Update last login
		await db
			.update(users)
			.set({ lastLogin: Date.now() })
			.where(eq(users.id, user.id))
			.run()

		// Return user without password hash
		const { passwordHash, ...userWithoutPassword } = user
		return userWithoutPassword as User
	},

	async getAll(): Promise<User[]> {
		const db = getDb()
		const rows = await db.select().from(users).all()
		return rows.map(({ passwordHash, ...user }) => user as User)
	},

	async getById(id: number): Promise<User | null> {
		const db = getDb()
		const user = await db.select().from(users).where(eq(users.id, id)).get()
		if (!user) return null
		const { passwordHash, ...userWithoutPassword } = user
		return userWithoutPassword as User
	},

	async create(input: CreateUserInput): Promise<User> {
		const db = getDb()
		const passwordHash = await bcrypt.hash(input.password, 12)

		const newUser: NewUser = {
			username: input.username,
			passwordHash,
			fullName: input.fullName,
			email: input.email,
			role: input.role,
			permissions: input.permissions ? JSON.stringify(input.permissions) : null,
			isActive: true,
			createdAt: Date.now(),
		}

		const result = await db.insert(users).values(newUser).returning().get()
		const { passwordHash: _, ...userWithoutPassword } = result
		return userWithoutPassword as User
	},

	async update(id: number, input: Partial<CreateUserInput>): Promise<User> {
		const db = getDb()
		const updateData: Partial<NewUser> = {}

		if (input.fullName) updateData.fullName = input.fullName
		if (input.email !== undefined) updateData.email = input.email
		if (input.role) updateData.role = input.role
		if (input.permissions) updateData.permissions = JSON.stringify(input.permissions)
		if (input.password) {
			updateData.passwordHash = await bcrypt.hash(input.password, 12)
		}

		const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning().get()
		const { passwordHash, ...userWithoutPassword } = result
		return userWithoutPassword as User
	},

	async delete(id: number): Promise<void> {
		const db = getDb()
		await db.update(users).set({ isActive: false }).where(eq(users.id, id)).run()
	},
}

