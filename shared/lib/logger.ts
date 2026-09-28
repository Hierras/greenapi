const isDev = process.env.NODE_ENV === 'development'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const levelColors: Record<LogLevel, string> = {
  debug: '\x1b[36m',   // Cyan
  info: '\x1b[32m',    // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
}
const resetColor = '\x1b[0m'

const getTimestamp = () => new Date().toISOString()

function serializeError(err: Error): Record<string, unknown> {
  return {
    name: err.name,
    message: err.message,
    stack: isDev ? err.stack : undefined,
    cause: err.cause instanceof Error ? serializeError(err.cause) : err.cause,
  }
}

function normalizeData(data: unknown): unknown {
  if (data instanceof Error) {
    if (typeof AggregateError !== 'undefined' && data instanceof AggregateError) {
      return {
        name: data.name,
        message: data.message,
        errors: data.errors.map((e) =>
          e instanceof Error ? serializeError(e) : e
        ),
      }
    }
    return serializeError(data)
  }

  if (data === null || typeof data !== 'object') return data

  if (Array.isArray(data)) return data.map(normalizeData)

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    out[k] = v instanceof Error ? serializeError(v) : v
  }
  return out
}

function safeStringify(value: unknown, space: number): string {
  const seen = new WeakSet<object>()
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'bigint') return val.toString()
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]'
          seen.add(val)
        }
        return val
      },
      space
    )
  } catch (e) {
    return `[Unserializable: ${e instanceof Error ? e.message : String(e)}]`
  }
}

function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = getTimestamp()
  const color = levelColors[level]

  if (!isDev && level === 'debug') return

  const payload =
    data === undefined ? '' : safeStringify(normalizeData(data), isDev ? 2 : 0)

  const logLine = [
    `${color}[${level.toUpperCase()}]${resetColor}`,
    `${timestamp}`,
    message,
    payload,
  ]
    .filter(Boolean)
    .join(' ')

  if (level === 'error') {
    console.error(logLine)
  } else if (level === 'warn') {
    console.warn(logLine)
  } else {
    console.log(logLine)
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, data),
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),

  child: (context: string) => ({
    debug: (msg: string, data?: unknown) =>
      log('debug', `[${context}] ${msg}`, data),
    info: (msg: string, data?: unknown) =>
      log('info', `[${context}] ${msg}`, data),
    warn: (msg: string, data?: unknown) =>
      log('warn', `[${context}] ${msg}`, data),
    error: (msg: string, data?: unknown) =>
      log('error', `[${context}] ${msg}`, data),
  }),
}

export const logError = (error: unknown, context?: string) => {
  const prefix = context ? `[${context}] ` : ''

  if (error instanceof Error) {
    logger.error(`${prefix}${error.message}`, error)
  } else {
    logger.error(`${prefix}Unknown error`, { error })
  }
}

export default logger