import { FastifySchema } from 'fastify'
import { z } from 'zod'

export function zodToJsonSchema(zodSchema: z.ZodTypeAny): any {
	if (zodSchema instanceof z.ZodObject) {
		const shape: Record<string, any> = {}
		const obj = zodSchema._def.shape()
		for (const key in obj) {
			shape[key] = zodToJsonSchema(obj[key])
		}
		return {
			type: 'object',
			properties: shape,
			required: Object.keys(shape).filter((k) => {
				const field = obj[k]
				return !(field instanceof z.ZodOptional || field instanceof z.ZodDefault)
			}),
		}
	}
	if (zodSchema instanceof z.ZodString) {
		return { type: 'string' }
	}
	if (zodSchema instanceof z.ZodNumber) {
		return { type: 'number' }
	}
	if (zodSchema instanceof z.ZodBoolean) {
		return { type: 'boolean' }
	}
	if (zodSchema instanceof z.ZodArray) {
		return {
			type: 'array',
			items: zodToJsonSchema(zodSchema._def.type),
		}
	}
	if (zodSchema instanceof z.ZodEnum) {
		return {
			type: 'string',
			enum: zodSchema._def.values,
		}
	}
	if (zodSchema instanceof z.ZodOptional) {
		return zodToJsonSchema(zodSchema._def.innerType)
	}
	if (zodSchema instanceof z.ZodDefault) {
		return zodToJsonSchema(zodSchema._def.innerType)
	}
	return { type: 'object' }
}

export function createSwaggerSchema(
	description: string,
	tag: string,
	body?: z.ZodTypeAny,
	params?: Record<string, any>,
	query?: Record<string, any>,
	response?: Record<number, any>
): FastifySchema {
	const schema: FastifySchema = {
		tags: [tag],
		description,
		security: [{ bearerAuth: [] }],
	}

	if (body) {
		schema.body = zodToJsonSchema(body)
	}

	if (params) {
		schema.params = {
			type: 'object',
			properties: params,
			required: Object.keys(params),
		}
	}

	if (query) {
		schema.querystring = {
			type: 'object',
			properties: query,
		}
	}

	if (response) {
		schema.response = {}
		for (const [status, schema] of Object.entries(response)) {
			schema.response[status] = schema
		}
	}

	return schema
}

