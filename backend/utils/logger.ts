import path from 'node:path'
import fs from 'node:fs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
	level: LogLevel
	message: string
	timestamp: string
	details?: unknown
	error?: {
		name: string
		message: string
		stack?: string
	}
}

class Logger {
	private logDir: string
	private logFile: string
	private maxLogSize = 10 * 1024 * 1024 // 10MB
	private maxLogFiles = 5

	constructor() {
		const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
		this.logDir = logDir
		this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`)

		// Ensure log directory exists
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true })
		}
	}

	private formatMessage(level: LogLevel, message: string, details?: unknown): LogEntry {
		return {
			level,
			message,
			timestamp: new Date().toISOString(),
			details,
			...(details instanceof Error && {
				error: {
					name: details.name,
					message: details.message,
					stack: details.stack,
				},
			}),
		}
	}

	private writeToFile(entry: LogEntry): void {
		try {
			const logLine = JSON.stringify(entry) + '\n'
			fs.appendFileSync(this.logFile, logLine, 'utf8')

			// Rotate log if size exceeds limit
			const stats = fs.statSync(this.logFile)
			if (stats.size > this.maxLogSize) {
				this.rotateLogs()
			}
		} catch (error) {
			console.error('Failed to write to log file:', error)
		}
	}

	private rotateLogs(): void {
		try {
			const files = fs.readdirSync(this.logDir).filter((f) => f.startsWith('app-') && f.endsWith('.log'))
			files.sort().reverse()

			// Keep only maxLogFiles
			if (files.length >= this.maxLogFiles) {
				for (let i = this.maxLogFiles - 1; i < files.length; i++) {
					fs.unlinkSync(path.join(this.logDir, files[i]))
				}
			}

			// Create new log file with current date
			this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`)
		} catch (error) {
			console.error('Failed to rotate logs:', error)
		}
	}

	private log(level: LogLevel, message: string, details?: unknown): void {
		const entry = this.formatMessage(level, message, details)
		const consoleMessage = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`

		// Console output
		switch (level) {
			case 'debug':
				console.debug(consoleMessage, details)
				break
			case 'info':
				console.info(consoleMessage, details)
				break
			case 'warn':
				console.warn(consoleMessage, details)
				break
			case 'error':
			case 'critical':
				console.error(consoleMessage, details)
				break
		}

		// File output
		this.writeToFile(entry)
	}

	debug(message: string, details?: unknown): void {
		this.log('debug', message, details)
	}

	info(message: string, details?: unknown): void {
		this.log('info', message, details)
	}

	warn(message: string, details?: unknown): void {
		this.log('warn', message, details)
	}

	error(message: string, details?: unknown): void {
		this.log('error', message, details)
	}

	critical(message: string, details?: unknown): void {
		this.log('critical', message, details)
	}
}

export const logger = new Logger()

